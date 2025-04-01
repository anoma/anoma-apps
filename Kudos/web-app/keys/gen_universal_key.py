#!/usr/bin/env python3
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

with open("universalKeyPair.bin", "rb") as f:
    seed = f.read(32)

private_key = ed25519.Ed25519PrivateKey.from_private_bytes(seed)

# Encode in PKCS#8 DER format
private_key_der = private_key.private_bytes(
    encoding=serialization.Encoding.DER,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.NoEncryption()
)

with open("universalKeyPair.der", "wb") as f:
    f.write(private_key_der)
