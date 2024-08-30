import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ab", (m) => {
  const depositReward = m.contract("DepositReward", ["0x4236160D4c4f3b1aAca9722EB60024828DE92976", "0xEef54062399A0083bcA0035c08699411BF060801"]);

  return { depositReward };
});
