import { arraysMatch, countMatches, isOverUnderDrawWinner } from "../helpers";
import { OUTypes, WinningType } from "../types";

export const  getWinners =  async (tickets: Array<{
  numbers:Array<number>,
  totalCoins:number,
  id:number,
  userAddress:string,
  ouType:OUTypes
}>, winningNumber: Array<number>) =>{
    const winners = [];
    // const tickets = []
    for (const ticket of tickets) {
      let wonAnyPrize = false;
      const ticketNumbers = (ticket.numbers as unknown as Array<string>).map(
        (str) => parseInt(str),
      );
      // Check for grand prize winner
      if (ticket.totalCoins >= 3 && arraysMatch(ticketNumbers, winningNumber)) {
        winners.push({
          ticketId:ticket.id,
          winner: ticket.userAddress,
          winningType: WinningType.GRANDPRICE,
        });
        wonAnyPrize = true;
      }

      // Check for match draw winners
       if (!wonAnyPrize && ticket.totalCoins >= 4) {
        const matchCount = countMatches(ticketNumbers, winningNumber);
        if (matchCount === 5) {
          winners.push({
            ticketId:ticket.id,
            winner: ticket.userAddress,
            winningType: WinningType.MATCHDRAW5,
          });
          wonAnyPrize = true;
        } else if (matchCount === 4) {
          winners.push({
            ticketId:ticket.id,
            winner: ticket.userAddress,
            winningType: WinningType.MATCHDRAW4,
          });
          wonAnyPrize = true;
        } else if (matchCount === 3) {
          winners.push({
            ticketId:ticket.id,
            winner: ticket.userAddress,
            winningType: WinningType.MATCHDRAW3,
          });
          wonAnyPrize = true;
        }
      }

      // Check for over/under draw winner
       if (
        !wonAnyPrize &&
        ticket.totalCoins === 5 &&
        isOverUnderDrawWinner(winningNumber[5], ticketNumbers[5], ticket.ouType)
      ) {
        winners.push({
          ticketId:ticket.id,
          winner: ticket.userAddress,
          winningType: WinningType.OVERUNDERDRAW,
        });
      }
      else if(!wonAnyPrize){
        winners.push({
          ticketId:ticket.id,
          winner: ticket.userAddress,
          winningType: WinningType.NONE,
        });
      }
    }
    // console.log(winners,"winenrs____")
    return winners;
  }