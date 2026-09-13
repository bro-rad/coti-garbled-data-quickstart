// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {MpcCore, ctUint64, gtUint64, itUint64, utUint64} from "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

contract PrivateCounter {
    utUint64 private _sum;

    event CounterIncremented(address indexed account);

    constructor() {
        gtUint64 sum_ = MpcCore.setPublic64(uint64(0));
        _sum = MpcCore.offBoardCombined(sum_, msg.sender);
    }

    function sum() external view returns (ctUint64) {
        return _sum.userCiphertext;
    }

    function add(itUint64 calldata value) external {
        gtUint64 value_ = MpcCore.validateCiphertext(value);
        gtUint64 sum_ = MpcCore.onBoard(_sum.ciphertext);
        sum_ = MpcCore.checkedAdd(sum_, value_);
        _sum = MpcCore.offBoardCombined(sum_, msg.sender);

        emit CounterIncremented(msg.sender);
    }
}
