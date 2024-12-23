#!/usr/bin/env python3
from pathlib import Path
import sys

def make_args(args):
    inner_args_list = [a for a in args if a.strip()]
    if inner_args_list:
        inner_args = " ".join(inner_args_list)
        return "[{} 0]".format(inner_args)
    else:
        return "0"

if __name__ == "__main__":
    argFiles = sys.argv[1:]
    assert len(argFiles) > 0
    args = []
    for argFile in argFiles:
        contents = Path(argFile).read_text()
        args.append(contents)
    sys.set_int_max_str_digits(0)
    print(make_args(args))
