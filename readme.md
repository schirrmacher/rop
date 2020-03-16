# ROP Playground

This Project helps to understand *Return Oriented Programming (ROP)*. I've implemented a *vulnerable* server, written in C,
and a client, written in JavaScript. The client can be used to send malicious messages to the server.

## Let's start!

1. Run ``make debug`` or ``make run`` to start the server
2. Execute the attack with ``make attack``

> **Note:** If you use ``make run`` make sure to change the ROP gadget addresses in the client script. This has to be done because *Address Space Layout Randomization (ASLR)* randomly shifts your ROP gadgets. When you use a debugger ASLR is automatically turned off.

## Explanation

When the server starts, it listens on port 1337 for messages with the following byte format:
```
0    1    2    3         n
+----+----+----+-- ... --+
| ps |  payload          |
+----+----+----+-- ... --+
```
``ps`` represents the payload size of the message which is sent by the client. Unfortunately, the server doesn't validate incoming ``ps`` values. Besides, the buffer which stores the message payload can only hold up to 32 bytes. 

When the attacker chooses a value of ``ps`` which is greater than 32, a buffer overflow occurs.



1. Classic Buffer Overflow

2. Stack Canaries

3. ASLR

