CC=gcc
SECURITYFLAGS=-fno-stack-protector -D_FORTIFY_SOURCE=0
DEST=build

all: server

attack:
	node client.js

build_folder:
	mkdir -p $(DEST)

server: build_folder
	$(CC) -g $(SECURITYFLAGS) -o $(DEST)/server server.c

debug: serverdebug
	lldb -o run $(DEST)/server

serverdebug: build_folder
	$(CC) -g $(SECURITYFLAGS) -o $(DEST)/server server.c -DDEBUG

run: all
	./$(DEST)/server

clean:
	rm -rf $(DEST)