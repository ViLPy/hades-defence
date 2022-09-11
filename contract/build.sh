#!/bin/bash
TARGET="${CARGO_TARGET_DIR:-target}"
set -e
cd "`dirname $0`/near-hades-contract"
USER_DIR=$(eval echo ~$user)
RUSTFLAGS="--remap-path-prefix ${USER_DIR}=~ -C link-arg=-s" cargo build --target wasm32-unknown-unknown --release
cp $TARGET/wasm32-unknown-unknown/release/near_hades_contract.wasm ./res/
