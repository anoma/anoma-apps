This directory contains 'universal' ed25519 keys, i.e keys generated from a 32 byte zero seed:

1. `universalKeyPair` - the concatenation of the ed25519 signing key and the verifying key
2. `universalVerifyingKey` - the ed25519 verifying key

## Generating the keys

You can generate the keys using the Python `pynacl` library as follows:

```console
python3 -m venv venv
source venv/bin/activate
pip install pynacl
python3 -c "from nacl.signing import SigningKey; sk = SigningKey(b'\x00'*32); open('universalKeyPair','wb').write(sk.encode() + sk.verify_key.encode())"
python3 -c "from nacl.signing import SigningKey; sk = SigningKey(b'\x00'*32); open('universalVerifyingKey','wb').write(sk.verify_key.encode())"
```
