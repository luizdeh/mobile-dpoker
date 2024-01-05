// import { pix } from "../lib/pix";

interface Winners {
  player_id: number;
  player_name: string;
  profit: number;
  winner_balance: number;
}

interface Losers {
  player_id: number;
  player_name: string;
  profit: number;
  loser_balance: number;
}

interface Payments {
  game: number;
  winners: Winners[];
  losers: Losers[];
  total_balance: number;
}

const gameWinners = (game: any) =>
  game.active_players
    .filter((item: any) => item.profit > 0)
    .map((item: any) => {
      return {
        player_id: item.person_id,
        player_name: item.name,
        profit: Number(item.profit.toFixed(2)),
        winner_balance: 0,
      }
    })
    .sort((a: any, b: any) => b.profit - a.profit);

const gameLosers = (game: any) =>
  game.active_players
    .filter((item: any) => item.profit < 0)
    .map((item: any) => {
      return {
        player_id: item.person_id,
        player_name: item.name,
        profit: Number(item.profit.toFixed(2)),
        loser_balance: Number(item.profit.toFixed(2)),
      };
    })
    .sort((a: any, b: any) => b.profit - a.profit);
// console.log({ gameWinners, gameLosers });

const gameLosersTotal = (game: any) => gameLosers(game).reduce((a: any, b: any) => a + b.profit, 0);

export const makePaymentsObject = (game: any) => {
  return {
    game: game.id,
    winners: gameWinners(game),
    losers: gameLosers(game),
    total_balance: gameLosersTotal(game),
  };
};

export const makeValuesArray = (players: any) => players.map((item: any) => item.profit);

const clearArray = <T>(arr: T[]) => {
  while (arr.length > 0) {
    arr.pop();
  }
}

const fixed = (num: number) => {
  return num % 1 === 0 ? num : Number(num.toFixed(2));
};

const array: any = []

export const someCalcs: any = (winners: any, losers: any, arr?: any) => {
  const newArray = array
  let _winners = winners
  let _losers = losers.map((item: any) => Math.abs(item))

  let win_balance = _winners.reduce((a: any, b: any) => a + b, 0);
  let los_balance = _losers.reduce((a: any, b: any) => a + b, 0);

  for (let i = 0; i < _winners.length; i++) {
    // console.log(`iterating over winner idx ${i}`);
    while (fixed(_winners[i]) > 0) {
      for (let j = _losers.length - 1; j >= 0; j--) {
        let res = 0
        // console.log('----------------------------------------------');
        // console.log(`winner idx [ ${i} ] iterating over loser idx [ ${j} ]`);
        if (fixed(_winners[i]) === fixed(_losers[j]) && fixed(_losers[j]) > 0) {
          res = fixed(_losers[j])
          array.push({ transfer: res, from: j, to: i })
          // console.log('_winners[i] === _losers[j]');
          // console.log(`_winners[i]: ${fixed(_winners[i])}`);
          // console.log(`_losers[j]: ${fixed(_losers[j])}`);
          // console.log(`transfer: ${res}`);
          win_balance -= res
          los_balance -= res
          _losers[j] = 0
          _winners[i] = 0
          res = 0
        }
        if (fixed(_winners[i]) > fixed(_losers[j]) && fixed(_losers[j]) > 0) {
          res = fixed(_losers[j])
          array.push({ transfer: res, from: j, to: i })
          // console.log('_winners[i] > _losers[j]');
          // console.log(`_winners[i]: ${fixed(_winners[i])}`);
          // console.log(`_losers[j]: ${fixed(_losers[j])}`);
          // console.log(`transfer: ${res}`);
          win_balance -= res
          los_balance -= res
          _winners[i] -= res
          _losers[j] = 0
          res = 0
        }
        if (fixed(_winners[i]) < fixed(_losers[j]) && fixed(_winners[i]) > 0) {
          res = fixed(_winners[i])
          array.push({ transfer: res, from: j, to: i })
          // console.log('_winners[i] < _losers[j]');
          // console.log(`_winners[i]: ${fixed(_winners[i])}`);
          // console.log(`_losers[j]: ${fixed(_losers[j])}`);
          // console.log(`transfer: ${res}`);
          win_balance -= res
          los_balance -= res
          _losers[j] -= res
          _winners[i] = 0
          res = 0
        }
      }
      // console.log(`exiting the while loop for winner idx [ ${i} ]`);
      // console.log('----------------------------------------------');
    }
  }
  if (win_balance === 0) {
    const res = array
    return res
  }
  return someCalcs(_winners, _losers, newArray)
};

export function settlePayments(payments: any, paymentsObject: any) {
  const _payments = payments
  const winners = paymentsObject.winners
  const losers = paymentsObject.losers

  winners.forEach((winner: any, idx: number) => {
    const filter = _payments.filter((item: any) => item.to === idx && item.transfer > 0)
    winner.transfer = filter.map((item: any) => {
      const findLoser = losers.find((loser: any, index: number) => item.from === index)
      return { transfer: item.transfer, from_id: findLoser.player_id, from_name: findLoser.player_name }
    })
  })

  const settle = [...winners.map((winner: any, idx: number) => {
    // return winner.transfer.map((item: any) => `${item.from_name.toUpperCase()} paga $${item.transfer.toFixed(2)} para ${winner.player_name.toUpperCase()}`)
    return winner.transfer.map((item: any) => {
      // console.log(`${item.from_name.toUpperCase()} paga $${item.transfer.toFixed(2)} para ${winner.player_name.toUpperCase()}`)
      return { transfer: item.transfer, from: item.from_name.toUpperCase(), to: winner.player_name.toUpperCase(), from_id: item.from_id, to_id: winner.player_id }
    })
  })]

  return settle.flat()
}

const copyContent = async (content: any) => {
  try {
    await navigator.clipboard.writeText(content);
    console.log('Content copied to clipboard');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export const doItAll = (game: any) => {
  const payments = makePaymentsObject(game)
  // console.log({ payments })
  const winners = makeValuesArray(payments.winners)
  // console.log({ winners })
  const losers = makeValuesArray(payments.losers)
  // console.log({ losers })
  const calc = someCalcs(winners, losers)
  // console.log({ calc })
  const settlement = settlePayments(calc, payments)
  const paymentText = settlement.map((item: any) => `${item.from} paga $${item.transfer} para ${item.to}`).flat().join('\n')
  // const getPix = pix(item.to_id)
  // return `${item.from} paga $${item.transfer} para ${item.to} ${getPix ? `( ${Number(getPix)} )` : null}`
  copyContent(paymentText)
  console.log(paymentText)
  clearArray(array)
  return settlement
}