import {
    Blockfrost,
    Data,
    Lucid,
    SpendingValidator,
    TxHash,
    fromHex,
    toHex,
    TxComplete,
    TxSigned,
    Constr,
    utf8ToHex
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


const validator = await readValidator();


const vali = await readValidator();


const policyId = lucid.utils.mintingPolicyToId(vali);


const unit = policyId + utf8ToHex("DuongDo");


async function readValidator(): Promise<SpendingValidator> {
    const validator = JSON
            .parse(await Deno.readTextFile("plutus.json"))
            .validators[0];
    return {
        type: "PlutusV2",
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),
    };
}
const publicKeyHash = lucid.utils
.getAddressDetails(await lucid.wallet.address())
.paymentCredential
?.hash;
const datum = Data.to(new Constr(0, [publicKeyHash!]));
const txHash = await lockAsset(5n, { into: validator, owner: datum });
await lucid.awaitTx(txHash);
console.log(`1 tADA locked into the contract at:
    Tx ID: ${txHash}
    Datum: ${datum}
`);



async function lockAsset(
    quantity: bigint,
    { into, owner }: { into: SpendingValidator; owner: string }, // Truyền datum đã mã hóa
): Promise<TxHash> {
    const redeemer = Data.to(new Constr(0, [0n]));
    const contractAddress = lucid.utils.validatorToAddress(into);
    const tx = await lucid
        .newTx()
        .mintAssets({ [unit]: quantity },  redeemer) // Số lượng token mint
        .attachMintingPolicy(validator)
        .payToContract(contractAddress, { inline: owner }, { [unit]: quantity }) // Sử dụng `inline` cho `datum`
        const txComplete: TxComplete = await tx.complete();  // Hoàn tất giao dịch.
        const txSigned: TxSigned = await txComplete.sign().complete();  // Ký giao dịch.
        console.log("txCBOR:", txSigned.toString());
    const hashTx = await txSigned.submit();
    await Deno.writeTextFile("txHash.tx", hashTx);
    return hashTx;
}