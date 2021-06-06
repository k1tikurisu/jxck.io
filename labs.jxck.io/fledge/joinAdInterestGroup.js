const host = location.host.split('.').shift() // shopping or travel

const interestGroup = {
  name: host,
  owner: `https://${host}.labs.jxck.io`, // dsp

  // x-allow-fledge: true
  biddingLogicUrl: `https://${host}.labs.jxck.io/fledge/bidding_logic.js`,

  // x-allow-fledge: true
  trustedBiddingSignalsUrl: `https://${host}.labs.jxck.io/fledge/bidding_signal.json`,
  trustBiddingSignalsKeys: ["bidding_signals_keys"],

  dailyUpdateUrl: "", // not implemented yets
  userBiddingSignals: { user_bidding_signals: "user_bidding_signals" },
  ads: [
    {
      renderUrl: `https://${host}.labs.jxck.io/fledge/${host}-ad.html`,
      metadata: {
        type: host
      }
    }
  ]
}
console.log(interestGroup)

document.addEventListener("DOMContentLoaded", async (e) => {
  console.log(e)
  const kSecsPerDay = 3600*24*30
  console.log(await navigator.joinAdInterestGroup(interestGroup, kSecsPerDay))
})