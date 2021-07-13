import { BigInt } from "@graphprotocol/graph-ts"
import { LotteryCreated, LotteryStaked, LotteryClosed, LotteryCancelled } from "../generated/LotteryPoolFactory/LotteryPoolFactory"
import { LotteryPool } from "../generated/schema"

export function handleLotteryCreated(event: LotteryCreated): void {
  let lottery = LotteryPool.load(event.params.lotteryId.toString())
  if (lottery == null){
    lottery = new LotteryPool(event.params.lotteryId.toString())
  }

  lottery.address = event.params.lotteryAddress
  lottery.creator = event.params.creator
  lottery.status = "OPEN"
  lottery.lotteryPoolType = event.params.lotteryPoolType == new BigInt(0) ? "STANDARD" : "YIELD"
  lottery.nftAddress = event.params.nftAddress
  lottery.nftIndex = event.params.nftIndex
  lottery.ticketPrice = event.params.ticketPrice
  lottery.minProfit = event.params.minAmount
  lottery.created = event.params.created
  lottery.stakingAdapter = event.params.stakingAdapter
  lottery.stakingAdapterName = event.params.stakingAdapterName.toString()

  lottery.save()
}

export function handleLotteryStaked(event: LotteryStaked): void {
  let lottery = LotteryPool.load(event.params.lotteryId.toString())
  if (lottery == null){
    lottery = new LotteryPool(event.params.lotteryId.toString())
  }

  lottery.status = "STAKING"
  lottery.stakedAmount = event.params.stakedAmount
  lottery.save()
}

export function handleLotteryClosed(event: LotteryClosed): void {
  let lottery = LotteryPool.load(event.params.lotteryId.toString())
  if (lottery == null){
    lottery = new LotteryPool(event.params.lotteryId.toString())
  }

  lottery.status = "CLOSED"
  lottery.winner = event.params.winner
  lottery.profit = event.params.profit
  lottery.fees = event.params.fees
  lottery.save()
}

export function handleLotteryCancelled(event: LotteryCancelled): void {
  let lottery = LotteryPool.load(event.params.lotteryId.toString())
  if (lottery == null){
    lottery = new LotteryPool(event.params.lotteryId.toString())
  }

  lottery.status = "CANCELLED"
  lottery.fees = event.params.fees
  lottery.save()
}