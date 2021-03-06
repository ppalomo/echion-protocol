// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class LotteryCreated extends ethereum.Event {
  get params(): LotteryCreated__Params {
    return new LotteryCreated__Params(this);
  }
}

export class LotteryCreated__Params {
  _event: LotteryCreated;

  constructor(event: LotteryCreated) {
    this._event = event;
  }

  get lotteryId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get creator(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get lotteryAddress(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get nftAddress(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get nftIndex(): BigInt {
    return this._event.parameters[4].value.toBigInt();
  }

  get ticketPrice(): BigInt {
    return this._event.parameters[5].value.toBigInt();
  }

  get created(): BigInt {
    return this._event.parameters[6].value.toBigInt();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class LotteryFactory extends ethereum.SmartContract {
  static bind(address: Address): LotteryFactory {
    return new LotteryFactory("LotteryFactory", address);
  }

  lotteries(param0: BigInt): Address {
    let result = super.call("lotteries", "lotteries(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);

    return result[0].toAddress();
  }

  try_lotteries(param0: BigInt): ethereum.CallResult<Address> {
    let result = super.tryCall("lotteries", "lotteries(uint256):(address)", [
      ethereum.Value.fromUnsignedBigInt(param0)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  numberOfActiveLotteries(): BigInt {
    let result = super.call(
      "numberOfActiveLotteries",
      "numberOfActiveLotteries():(uint256)",
      []
    );

    return result[0].toBigInt();
  }

  try_numberOfActiveLotteries(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "numberOfActiveLotteries",
      "numberOfActiveLotteries():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  owner(): Address {
    let result = super.call("owner", "owner():(address)", []);

    return result[0].toAddress();
  }

  try_owner(): ethereum.CallResult<Address> {
    let result = super.tryCall("owner", "owner():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  totalBalance(): BigInt {
    let result = super.call("totalBalance", "totalBalance():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalBalance(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("totalBalance", "totalBalance():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class CreateLotteryCall extends ethereum.Call {
  get inputs(): CreateLotteryCall__Inputs {
    return new CreateLotteryCall__Inputs(this);
  }

  get outputs(): CreateLotteryCall__Outputs {
    return new CreateLotteryCall__Outputs(this);
  }
}

export class CreateLotteryCall__Inputs {
  _call: CreateLotteryCall;

  constructor(call: CreateLotteryCall) {
    this._call = call;
  }

  get _nftAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _nftIndex(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _ticketPrice(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class CreateLotteryCall__Outputs {
  _call: CreateLotteryCall;

  constructor(call: CreateLotteryCall) {
    this._call = call;
  }
}

export class DecreaseTotalBalanceCall extends ethereum.Call {
  get inputs(): DecreaseTotalBalanceCall__Inputs {
    return new DecreaseTotalBalanceCall__Inputs(this);
  }

  get outputs(): DecreaseTotalBalanceCall__Outputs {
    return new DecreaseTotalBalanceCall__Outputs(this);
  }
}

export class DecreaseTotalBalanceCall__Inputs {
  _call: DecreaseTotalBalanceCall;

  constructor(call: DecreaseTotalBalanceCall) {
    this._call = call;
  }

  get _lotteryId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class DecreaseTotalBalanceCall__Outputs {
  _call: DecreaseTotalBalanceCall;

  constructor(call: DecreaseTotalBalanceCall) {
    this._call = call;
  }
}

export class IncreaseTotalBalanceCall extends ethereum.Call {
  get inputs(): IncreaseTotalBalanceCall__Inputs {
    return new IncreaseTotalBalanceCall__Inputs(this);
  }

  get outputs(): IncreaseTotalBalanceCall__Outputs {
    return new IncreaseTotalBalanceCall__Outputs(this);
  }
}

export class IncreaseTotalBalanceCall__Inputs {
  _call: IncreaseTotalBalanceCall;

  constructor(call: IncreaseTotalBalanceCall) {
    this._call = call;
  }

  get _lotteryId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get _amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class IncreaseTotalBalanceCall__Outputs {
  _call: IncreaseTotalBalanceCall;

  constructor(call: IncreaseTotalBalanceCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends ethereum.Call {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}
