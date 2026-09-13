// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {MpcCore, ctUint64, gtUint64, itUint64, utUint64} from "@coti-io/coti-contracts/contracts/utils/mpc/MpcCore.sol";

contract PrivateCounter {
    mapping(address account => utUint64 sum) private _sums;
    mapping(address account => bool) public hasCounter;

    event CounterIncremented(address indexed account);
    event CounterDecremented(address indexed account);

    function sum() external view returns (ctUint64) {
        return _sums[msg.sender].userCiphertext;
    }

    function add(itUint64 calldata value) external {
        gtUint64 value_ = MpcCore.validateCiphertext(value);
        gtUint64 sum_ = hasCounter[msg.sender] ? MpcCore.onBoard(_sums[msg.sender].ciphertext) : MpcCore.setPublic64(uint64(0));
        sum_ = MpcCore.checkedAdd(sum_, value_);
        _sums[msg.sender] = MpcCore.offBoardCombined(sum_, msg.sender);
        hasCounter[msg.sender] = true;

        emit CounterIncremented(msg.sender);
    }

    function subtract(itUint64 calldata value) external {
        require(hasCounter[msg.sender], "counter is empty");

        gtUint64 value_ = MpcCore.validateCiphertext(value);
        gtUint64 sum_ = MpcCore.onBoard(_sums[msg.sender].ciphertext);
        sum_ = MpcCore.checkedSub(sum_, value_);
        _sums[msg.sender] = MpcCore.offBoardCombined(sum_, msg.sender);

        emit CounterDecremented(msg.sender);
    }
}
