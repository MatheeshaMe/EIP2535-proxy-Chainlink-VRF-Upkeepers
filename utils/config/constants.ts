export const USDT_THRESHOLD = 10 ** 6
export type WinningEntry = {
    _numbers: number[]
    _grandPriceCoins: number
    _matchDrawCoins: number
    _overUnderDrawCoins: number
    _ovType: number
    _matchDraw: boolean
    _overUnderDraw: boolean
}
//_ovType == 1 ? over : under
export const winning: {
    grandWinning: WinningEntry //coins - 5
    matchDrawWinning5: WinningEntry //coins- 5
    matchDrawWinning4: WinningEntry //coins- 5
    matchDrawWinning3: WinningEntry  //coins- 5
    overUnderDrawWinningOver: WinningEntry
    overUnderDrawWinningUnder: WinningEntry
    overUnderDrawExact: WinningEntry
    onlyGrandPrize: WinningEntry
    // onlyMatchDraw: WinningEntry
    // onlyOverUnderDraw: WinningEntry
    // winMultipleDraws: WinningEntry
    // loseMultipleDraws: WinningEntry
    // noWinningAtAll: WinningEntry
    [key: string]: WinningEntry
} = {
    /*1
 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
coins - 5
 */
    grandWinning: { 
        _numbers: [3, 5, 6, 16, 25, 19],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 1,
        _matchDraw: true,
        _overUnderDraw: true,
    },
    /*2
 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
 coins - 5
 */
    matchDrawWinning5: {
        _numbers: [3, 5, 6, 16, 25, 20],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 1,
        _matchDraw: true,
        _overUnderDraw: true,
    },
//     /*3
//   0x90F79bf6EB2c4f870365E785982E1f101E93b906
// coins - 5
//   */
    matchDrawWinning4: {
        _numbers: [3, 5, 6, 16, 2, 1],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 1,
        _matchDraw: true,
        _overUnderDraw: true,
    },
//     /*4
//    0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
// coins - 5
//    */ 
  matchDrawWinning3: {
        _numbers: [3, 5, 6, 2, 1, 7],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 1,
        _matchDraw: true,
        _overUnderDraw: true,
    },
//     /*5
//     0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
//     coins - 5
//  */ 
overUnderDrawWinningOver: {
        _numbers: [1, 2, 4, 2, 3, 20],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 0, // "Under" prediction
        _matchDraw: true,
        _overUnderDraw: true,
    },
// //     /*6
// //     0x976EA74026E726554dB657fA54763abd0C3a0aa9
//        coins - 5
// //     */ 
   overUnderDrawWinningUnder: {
        _numbers: [1, 2, 4, 2, 3, 18],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 1, // "Over" prediction
        _matchDraw: true,
        _overUnderDraw: true,
    },
// //     /*7
// //    0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
    //   coins - 5
// //    */ 
  overUnderDrawExact: {
        _numbers: [1, 2, 4, 2, 3, 19],
        _grandPriceCoins: 3,
        _matchDrawCoins: 1,
        _overUnderDrawCoins: 1,
        _ovType: 1,
        _matchDraw: true,
        _overUnderDraw: true,
    },
//     /*8
//     0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
     //coins - 3
//     */ 
   onlyGrandPrize: {
        _numbers: [3, 5, 6, 16, 25, 19],
        _grandPriceCoins: 3,
        _matchDrawCoins: 0,
        _overUnderDrawCoins: 0,
        _ovType: 1,
        _matchDraw: false,
        _overUnderDraw: false,
    },
//     /*9
//    0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
//    */ 
//   onlyMatchDraw: {
//         _numbers: [3, 5, 6, 16, 25, 20],
//         _grandPriceCoins: 3,
//         _matchDrawCoins: 1,
//         _overUnderDrawCoins: 0,
//         _ovType: 1,
//         _matchDraw: true,
//         _overUnderDraw: false,
//     },
//     /*10
//    0xBcd4042DE499D14e55001CcbB24a551F3b954096
//    */ 
//   onlyOverUnderDraw: {
//         _numbers: [1, 2, 4, 2, 3, 20],
//         _grandPriceCoins: 3,
//         _matchDrawCoins: 0,
//         _overUnderDrawCoins: 1,
//         _ovType: 1,
//         _matchDraw: false,
//         _overUnderDraw: true,
//     },
//     /*11
//    0x71bE63f3384f5fb98995898A86B02Fb2426c5788
//    */ 
//   winMultipleDraws: {
//         _numbers: [3, 5, 6, 16, 25, 19],
//         _grandPriceCoins: 3,
//         _matchDrawCoins: 1,
//         _overUnderDrawCoins: 1,
//         _ovType: 1,
//         _matchDraw: true,
//         _overUnderDraw: true,
//     },
//     /*12
//     0xFABB0ac9d68B0B445fB7357272Ff202C5651694a
//     */
//     loseMultipleDraws: {
//         _numbers: [1, 2, 4, 2, 3, 18],
//         _grandPriceCoins: 3,
//         _matchDrawCoins: 1,
//         _overUnderDrawCoins: 1,
//         _ovType: 0,
//         _matchDraw: false,
//         _overUnderDraw: false,
//     },
    /*13
    0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec
    */ 
//    noWinningAtAll: {
//         _numbers: [4, 4, 4, 4, 4, 4],
//         _grandPriceCoins: 3,
//         _matchDrawCoins: 1,
//         _overUnderDrawCoins: 1,
//         _ovType: 0,
//         _matchDraw: false,
//         _overUnderDraw: false,
//     },
}


