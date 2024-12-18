#!/usr/bin/env python3
import base64
import sys

def base64_to_atom(b):
    bs = base64.b64decode(b)
    return int.from_bytes(bs, byteorder='little')

if __name__ == "__main__":
    sys.set_int_max_str_digits(0)
    inLines = sys.stdin.readlines()
    for d in inLines[:-1]:
        print(base64_to_atom(d))
    print(base64_to_atom(inLines[-1]), end='')
