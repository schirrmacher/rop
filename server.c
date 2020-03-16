#include <strings.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

void print_date();

/*

  Message format in bytes:
  
  0    1    2    3         n
  +----+----+----+-- ... --+
  | ps |  payload          |
  +----+----+----+-- ... --+
  
  ps = payload size

*/
void parse_message(int socketfd)
{
    char payload[32] = {0};
    unsigned char ps;
    read(socketfd, &ps, 1);
    read(socketfd, payload, ps); // <-- buffer overflow if ps > 32
    print_date();
    printf("%s\n\n", payload);
}

void print_date()
{
    system("date");
}

void start()
{
    int listenfd = 0, connfd = 0;
    struct sockaddr_in serv_addr;

    listenfd = socket(AF_INET, SOCK_STREAM, 0);
    memset(&serv_addr, '0', sizeof(serv_addr));

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = INADDR_ANY;
    serv_addr.sin_port = htons(1337);

    if (bind(listenfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0)
    {
        perror("Could not bind socket");
        exit(EXIT_FAILURE);
    }

    listen(listenfd, 10);

    while (1)
    {
        connfd = accept(listenfd, (struct sockaddr *)NULL, NULL);

        parse_message(connfd);

        close(connfd);
    }
}

int main(int argc, char *argv[])
{
    printf("\nWelcome to the ROP playground!\n\n");

    printf("Process ID: %i\n", getpid());
    extern uintptr_t __stack_chk_guard;
    printf("__stack_chk_guard: 0x%lx\n", __stack_chk_guard);
    uintptr_t print_date_no_aslr = 0x100000ce0;
    printf("ASLR binary offset: +%p\n", &print_date - print_date_no_aslr);
    printf("- print_date is at %p\n", &print_date);
    printf("- system is at %p\n\n", &system);

    start();

    return 0;
}
