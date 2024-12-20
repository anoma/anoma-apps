#!/usr/bin/env python3

import base64
import math
import sys

def atom_to_base64(astr):
    a  = int(astr)
    bs = a.to_bytes(length = math.ceil(a.bit_length() / 8), byteorder='little')
    return base64.b64encode(bs).decode('utf-8')

if __name__ == "__main__":
    inLines = sys.stdin.readlines()
    if not inLines:
        print('', end='')
        exit(0)
    sys.set_int_max_str_digits(0)
    for d in inLines[:-1]:
        print(atom_to_base64(d))
    print(atom_to_base64(inLines[-1]), end='')
