import {
    Blockfrost,
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
    fromHex,
    toHex,
    utf8ToHex,
    Redeemer,
    UTxO,
    Constr,
    TxComplete,
    TxSigned,
} from "https://deno.land/x/lucid@0.8.3/mod.ts";
import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";
const lucid = await Lucid.new(
    new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0",
        "previeweskBWR7pI69XDaSEQnXYjjZ0gqpLSavk"
    ),
    "Preview"
);
lucid.selectWalletFromSeed(await Deno.readTextFile("./owner.seed"));
async function readValidator(): Promise<SpendingValidator> {
    const validator = JSON
            .parse(await Deno.readTextFile("plutus.json"))
            .validators[0];
    return {
        type: "PlutusV2",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
    };
}

async function unlockasset(utxos, { validator, redeemer }): Promise<TxHash> {
    const tx = await lucid
        .newTx()
        .collectFrom([utxos], redeemer)
        .addSigner(await lucid.wallet.address())
        .attachSpendingValidator(validator);
    const txComplete: TxComplete = await tx.complete();
    const txSigned: TxSigned = await txComplete.sign().complete();
    console.log("txSigned:", txSigned.toString());
    return txSigned.submit();
}
async function main() {
    const validator = await readValidator();
    console.log("validator: ", validator);
    const txHash = await Deno.readTextFile("txHash.tx");
    console.log("txHash: ", txHash);
    const [utxos] = await lucid.utxosByOutRef([{ txHash: txHash, outputIndex: 0 }]);
    console.log("utxo: ", utxos)
    const redeemer = Data.to(new Constr(0, [1n]));
    console.log("redeemer: ",redeemer);
    const scriptAddress = lucid.utils.validatorToAddress(validator);
    console.log("scriptAddress: ", scriptAddress)
    const tx = await unlockasset(utxos, { validator: validator, redeemer: redeemer });
    await lucid.awaitTx(tx);
    console.log(`tx hash: ${tx}, redeemer: ${redeemer}`);
}
main();