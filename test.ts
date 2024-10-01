import {
    Blockfrost,
    utils,
    C,
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
    fromHex,
    toHex,
    TxComplete,
    TxSigned,
} from "https://deno.land/x/lucid@0.8.3/mod.ts";

import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

// Function giả lập signatories (những người ký giao dịch)
function mockTransaction(signedBy: string[]) {
  return {
    extra_signatories: signedBy.map((sig) => utils.blake2b224(sig)),
  };
}

// Kiểm tra smart contract logic
Deno.test("Smart contract must be signed by owner or beneficiary", async () => {
  // Giả lập môi trường Lucid và ví
  const lucid = await Lucid.new(
    new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0",
        "previewwUtqY6CSLt3KjxLYQqAVj2Hsj6qMKmDs",
    ),
    "Preview",
);
  // Dữ liệu giả cho owner và beneficiary
  const owner = utils.blake2b224("owner_pubkey");
  const beneficiary = utils.blake2b224("beneficiary_pubkey");

  const validator = await readValidator();
  async function readValidator(): Promise<SpendingValidator> {
    const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];
    return {
        type: "PlutusV2",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
    }
}

  // Mock Datum
  const datum = { owner, beneficiary };

  // Trường hợp 1: Transaction được ký bởi owner
  let transaction = mockTransaction(["owner_pubkey"]);
  let result = await lucid.validator.must_be_signed_by(transaction, owner);
  assertEquals(result, true);

  // Trường hợp 2: Transaction được ký bởi beneficiary
  transaction = mockTransaction(["beneficiary_pubkey"]);
  result = await lucid.validator.must_be_signed_by(transaction, beneficiary);
  assertEquals(result, true);

  // Trường hợp 3: Transaction không được ký bởi owner hoặc beneficiary
  transaction = mockTransaction(["third_party_pubkey"]);
  result = await lucid.validator.must_be_signed_by(transaction, owner);
  assertEquals(result, false);
});
