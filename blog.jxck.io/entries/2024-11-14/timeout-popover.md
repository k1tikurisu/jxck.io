# [dialog][popover] Dialog と Popover #12

## Intro

Toast 相当を実装する場合、時間が経ったら自動で消えるタイムアウトを設定することがないだろうか?

今回 Popover の一連を調べる中であった、これが WCAG 違反だという議論を紹介する。


## Toast の Timeout

そもそも Toast といえば、「時間が経てば勝手に消える」というのを込みにしたイメージがないだろうか?

Popover の仕様の源流ともなった OpenUI による `<toast>` の提案でも、調査の結果多くの実装がそうなっているという点が挙げられている。

> Toasts are often displayed in the corner of app UI, and often disappear on a timeout.
>
> Toast とは通常、画面の端に表示され、通常時間が経つと勝手に消える。
> --- https://open-ui.org/components/toast.research/

筆者も、Toast とはそういうもので、Popover で Toast を実装する際も `setTimeout()` で `hidePopover()` する実装が普通に行われるだろうと思っていた。

なんなら、HTML の Popover の仕様にも、`setTimeout()` で `hidePopover()` するサンプルコードが載っていた。

- 6.12 The popover attribute
  - https://html.spec.whatwg.org/multipage/popover.html#the-popover-attribute

```html
<button id=submit>Submit</button>
<p><output><span popover=manual></span></output></p>

<script>
 const sBtn = document.getElementById("submit");
 const outSpan = document.querySelector("output [popover=manual]");
 let successMessage;
 let errorMessage;

 /* define logic for determining success of action
  and determining the appropriate success or error
  messages to use */

 sBtn.addEventListener("click", ()=> {
  if ( success ) {
   outSpan.textContent = successMessage;
  }
  else {
   outSpan.textContent = errorMessage;
  }
  outSpan.showPopover();

  setTimeout(function () {
   outSpan.hidePopover();
  }, 10000);
 });
</script>
```

Popover の API を見ている中で、これを明示的に行う API について議論していた際に、「そもそもタイムアウトすべきではない」という Toast の Explainer を真っ向から否定する意見にあった。

- Add AbortSignal for popover.showPopover() for initialize internal CloseWatcher · Issue #10428 · whatwg/html
  - https://github.com/whatwg/html/issues/10428

問題は、そこでコメントされた興味深い解釈だ。


## Timeout と WCAG

このスレッドの中で、「そもそも時間が経ったら消える UI は WCAG 違反だ」というコメントを、Keith Cirkel から受けた。

- Add AbortSignal for popover.showPopover() for initialize internal CloseWatcher · Issue #10428 · whatwg/html
  - https://github.com/whatwg/html/issues/10428#issuecomment-2186642041

Keith が引用しているのは以下だ。

- G5: Allowing users to complete an activity without any time limit | WAI | W3C
  - https://www.w3.org/WAI/WCAG22/Techniques/general/G5.html

> The objective of this technique is to provide users with all the time they need to complete an activity.
> This technique involves providing a specified activity which does not require timed interaction.
> Users are allowed as much time as they need to interact with the activity.
> --- https://www.w3.org/WAI/WCAG22/Techniques/general/G5.html

WCAG のこの推奨は「ユーザにアクティビティを求めるような UI は、タスクの完了までに制限時間を設けるべきではない」といった趣旨のものだ。例に挙がっているのは、Web での「試験」や「ゲーム」や「オークション」といったものに対して、タスクの完了に時間がかかるようなユーザでも、タスクを完了できるようにという意図を含んでいる。

今回の連載の文脈で言えば、例えば `<dialog>` はそもそもユーザに何か操作を求めるためにあるため、その `close()` を `setTimeout()` で呼ぶといった実装は避けるべきで、仮に素早くタスクを進められない状態のユーザでも、十分にタスクを完了できるように配慮すべきといった趣旨のものだ。

一方、勝手に消える `<toast>` が多いのは、必ずしもユーザに「アクティビティを求めていない」という暗黙の性質があり、OpenUI の調査の結果でも実世界の `<toast>` はそのように使われることが多く、そのため時間が経ったら消える実装が多用されていると考えられる。それどころか、明示的な「閉じる」ボタンを持たない `<toast>` もあるのではないだろうか? 主に通知に使われる `<toast>` が溜まって積み上がっていくのを防ぐ理由もあるだろう。別に数秒とかではなく、分単位のタイムアウトなどによる配慮をもった実装もあるように思う。

もちろん、OS の通知などもデフォルトでは時間と共に消え、明示的に消すまでは残すようなオプションを設定するといったものもあるだろう。

しかし、Keith の指摘ではタイムアウトする `<toast>` はこの推奨に違反するという判断らしい。

> Any interaction that is timed fails the criterion. A `<toast>` which pops up a temporal message fails the criterion.
> --- https://github.com/whatwg/html/issues/10428#issuecomment-2186785118

じゃあそもそも OpenUI の Explainer はなんだったんだ? という気持ちもするが、それはあくまでリアルワールドの実装を踏まえた Draft であり、議論を経たものではないため、一旦置いておこう。

Keith の解釈は、推奨の言う「activity」は、表示されたコンポーネントがボタンクリックやフォームの入力等、明示的な操作を要求していない場合、つまりメッセージの表示だけであっても適用されるということになる。

「確認」も「Activity」だという解釈はわからなくもないが、実世界の `<toast>` 実装はそうなっていないところを考えると、Keith 独自の解釈なのか一般的に適用すべき解釈なのか判断が難しくもある。

「閉じた通知を確認できる UI」を提供する方が、「明示的に閉じていない通知」が溜まっていくよりも良い場合もあるだろうし、通知を残すかどうかをいちいちユーザに設定させるにしても、デフォルトは考えないといけないだろう。


## 実世界の `<toast>` 実装

UI Component Library 系で `<toast>` 的な Component を提供している実装が、どのようなデフォルトになっているかを調べてみた。

- [Ant Design](https://ant.design/components/notification): 4.5s で消える
- [Boosted](https://boosted.orange.com/docs/5.3/components/toasts/#methods): 5s で消える
- [Bootstrap](https://getbootstrap.com/docs/5.3/components/toasts/#options): 5s で消える
- [Carbon](https://carbondesignsystem.com/components/notification/usage/): 消えない
- [Spectrum](https://spectrum.adobe.com/page/toast/): 消えない
- [React Aria](https://react-spectrum.adobe.com/react-aria/useToast.html): 消えない

なお、デフォルトでは消えないものも、自動で消える(auto-dismiss)機能を提供しているものがほとんどだ。


## ドキュメントの更新

彼の指摘とは裏腹に、HTML や MDN には `setTimeout()` で `hidePopover()` するサンプルコードが当たり前のように書かれている。

とりあえずこれを削除する PR を出した。

- remove usecases of popover with timeout by Jxck · Pull Request #34795 · mdn/content
  - https://github.com/mdn/content/pull/34795
- hidePopover with button click not timeout by Jxck · Pull Request #10469 · whatwg/html
  - https://github.com/whatwg/html/pull/10469

今のところ、PR に対して意見や議論はない。


## `<toast>` を実装する場合

単に「タイムアウトをなくす」で済めば良いが、実際にはそう簡単とも限らない。

明示的に消す必要があるということは、消さない限りは積み上がり続ける。発生の頻度が高ければ画面が埋まっていく。OS のようにそれを集約して小さくしたり、その中身をさらに個々に確認できるような UI が必要になるが、単なる `<toast>` コンポーネントが、そこまでの機能を持っている場合は多くないだろう。

これまで自動で消えていたものに対して、特に問題を感じていなかったユーザにとっては、「勝手に消えてくれなくなった」と思うかもしれない。すると、自動で消えるようなオプションを提供するべきか、という話になり、その実装は設定画面などにも及ぶだろう。

数秒は短いということを意識し、数分などの比較的長い時間を設定している実装はどうするべきか。

時間ではなく、他のイベントをフックして消える場合、それが短時間だったらどうするべきか。イベントが発生しても最低 N 秒は残すべき、とする場合、適切な N はいくつか。

考えることは多くある。

あくまで今回議論する中で一人から得たフィードバックではあるが、現状 Popover や Dialog を利用して `<toast>` 相当を実装したり、すでに実装を持っている場合は、この議論を参考にしてみてほしい。