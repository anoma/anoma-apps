#!/usr/bin/env python3
from pathlib import Path
import sys

def make_args(args):
    inner_args = " ".join([a for a in args])
    return "[{} 0]".format(inner_args)

if __name__ == "__main__":
    argFiles = sys.argv[1:]
    assert len(argFiles) > 0
    args = []
    for argFile in argFiles:
        contents = Path(argFile).read_text()
        args.append(contents)
    sys.set_int_max_str_digits(0)
    print(make_args(args))
