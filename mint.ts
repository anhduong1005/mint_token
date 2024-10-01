// import { Lucid, Blockfrost, fromText } from "https://deno.land/x/lucid@0.8.3/mod.ts";

// // Khởi tạo Lucid với Blockfrost
// const lucid = await Lucid.new(
//     new Blockfrost(
//         "https://cardano-preview.blockfrost.io/api/v0",
//         "previewwUtqY6CSLt3KjxLYQqAVj2Hsj6qMKmDs",
//     ),
//     "Preview",
// );

// // Chọn ví từ private key
// lucid.selectWalletFromPrivateKey('ed25519_sk1ffag0l5aw3n5q8jlf5er0xl2qz8zhry6emw06l8r2d6zye7q7acqln4nmj');

// // Lấy thông tin payment credential từ địa chỉ của ví
// const { paymentCredential } = lucid.utils.getAddressDetails(
//     await lucid.wallet.address(),
// );

// // Tạo minting policy
// const mintingPolicy = lucid.utils.nativeScriptFromJson({
//     type: "all",
//     scripts: [
//         {
//             type: "sig",
//             keyHash: paymentCredential.hash,
//         },
//     ],
// });

// // Lấy policy ID từ minting policy
// const policyId = lucid.utils.mintingPolicyToId(mintingPolicy);

// // Tạo đơn vị token với policy ID và tên token
// const unit = policyId + '64756f6e67646f';

// // Tạo giao dịch mint token
// const tx = await lucid.newTx()
//     .mintAssets({ [unit]: 1n }) // Số lượng token mint
//     .validTo(Date.now() + 200000) // Thời gian hết hạn giao dịch
//     .attachMintingPolicy(mintingPolicy) // Đính kèm policy vào giao dịch
//     .complete(); // Hoàn tất giao dịch

// // Ký giao dịch
// const signedTx = await tx.sign().complete();

// // Gửi giao dịch lên blockchain và nhận hash
// const txHash = await signedTx.submit();

// // In ra txHash để xác nhận
// console.log(`Transaction Hash: ${txHash}`);


import { Lucid, Blockfrost, utf8ToHex, SpendingValidator, fromHex, toHex,Constr, Data } 
    from "https://deno.land/x/lucid@0.8.3/mod.ts";

import * as cbor from "https://deno.land/x/cbor@v1.4.1/index.js";

// Khởi tạo Lucid với Blockfrost
const lucid = await Lucid.new(
    new Blockfrost(
        "https://cardano-preview.blockfrost.io/api/v0",
        "previewwUtqY6CSLt3KjxLYQqAVj2Hsj6qMKmDs",
    ),
    "Preview",
);

// Chọn ví từ seed
lucid.selectWalletFromSeed('promote mule category adult scorpion raw nuclear tip science paddle abstract insane path kitchen peace glue excess load lobster boss present pet guard wrong');

// Đọc validator từ file
const validator = await  readValidator();

// Lấy policy ID từ minting policy
const policyId = lucid.utils.mintingPolicyToId(validator);

async function readValidator(): Promise<SpendingValidator> {  
    const validator = JSON.parse(await Deno.readTextFile("plutus.json")).validators[0];  // Đọc file JSON và lấy validator đầu tiên.
    return {
        type: "PlutusV2",  // Chỉ định loại script là Plutus V2.
        script: toHex(cbor.encode(fromHex(validator.compiledCode))),  // Mã hóa script Plutus thành CBOR và chuyển thành dạng hex.
    };
}


// Tạo đơn vị token với policy ID và tên token
const unit = policyId + utf8ToHex("DuongDo");
const redeemer = Data.to(new Constr(0, [0n]));


// Tạo giao dịch mint token
const tx = await lucid.newTx()
    .mintAssets({ [unit]: 500n },  redeemer) // Số lượng token mint
    .attachMintingPolicy(validator) // Đính kèm policy vào giao dịch
    .complete(); // Hoàn tất giao dịch

// Ký giao dịch
const signedTx = await tx.sign({}).complete();


// Gửi giao dịch lên blockchain và nhận hash
const txHash = await signedTx.submit();

// In ra txHash để xác nhận
console.log(`Transaction Hash: ${txHash}`);