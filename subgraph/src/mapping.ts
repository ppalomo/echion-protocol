import { BigInt } from "@graphprotocol/graph-ts"
import { LotteryCreated } from "../generated/LotteryFactory/LotteryFactory"
import { Lottery } from "../generated/schema"

export function handleLotteryCreated(event: LotteryCreated): void {
  let lottery = Lottery.load(event.params.lotteryId.toString())
  if (lottery == null){
    lottery = new Lottery(event.params.lotteryId.toString())
  }

  lottery.address = event.params.lotteryAddress
  lottery.creator = event.params.creator
  lottery.status = "OPEN"
  lottery.nftAddress = event.params.nftAddress
  lottery.nftIndex = event.params.nftIndex
  lottery.ticketPrice = event.params.ticketPrice
  lottery.created = event.params.created
  lottery.save()
}


