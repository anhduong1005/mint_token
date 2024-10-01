// use aiken/transaction.{ScriptContext, OutputReference}
use aiken/transaction.{Mint, ScriptContext, Spend}

type Redeemer {
  msg: Int,
}

validator {
  fn mint_policy(redeemer: Redeemer, ctx: ScriptContext) -> Bool {
    when ctx.purpose is {
      Mint(_) -> redeemer.msg == 0
      // Điều kiện về redeemer, ví dụ: phải có chữ "Hello"
      Spend(_) -> redeemer.msg == 1
      _ -> False
    }
  }
}

// validator {

// }

// test hello() {
//   let redeemer = Redeemer {msg: "Hello"}
//    let context = ScriptContext {
//     purpose: Spend(
//         OutputReference,
//       ),
//   }
//   hello_spend(redeemer, context)
// }
