# [html][web] なぜ html の form は PUT / DELETE をサポートしないのか?

## Intro

10 年ほど前に同じことを調べたことがある。

当時は全くの素人で、素人なりに調査はしたが、ほとんどが推測の域を出ない結論だった。

この問題についての回答を、あらためて記す。


## 仕様策定の経緯

表題の通り、 `<form>` の `method` には `GET` と `POST` しかサポートされていない。

HTTP には他にも `PUT` や `DELETE` といったメソッドもあるのに、なぜサポートされていないのかという話だ。

仕様が決定した経緯は、以下に残っている。

> Status: Rejected
> Change Description: no spec change
> Rationale: PUT as a form method makes no sense, you wouldn't want to PUT a form payload.
> DELETE only makes sense if there is no payload, so it doesn't make much sense with forms either.
> --- https://www.w3.org/Bugs/Public/show_bug.cgi?id=10671#c16

今思えば、そもそもここで説明されている通りだったが、当時はこの Rationale が説明不足に思え腑に落ちていなかったんだと思う。

実は数年前、この件について直接 Hixie に聞いてみたことがある。

Hixie (Ian Hickson) は、 WHATWG のスペックエディターとして HTML や CSS の仕様を多く作成した人物だ。画像への `alt` について何本も提案を出したり、ブログが使う Pingback の仕様や、 Server Sent Events / WebSocket といった野心的な仕様を数多く残している。いわゆる HTML5 を強力に牽引し、今の Web の基礎を作った人物の一人と言って差し支えないだろう。筆者にとってレジェンドの一人だ。

もう数年前に WHATWG を離れてはいるが、彼は筆者の質問に丁寧に答えてくれた。彼とのやりとりは非常にエキサイティングだった、その記憶を頼りに書いておく。


## Form と HTTP

そもそも、なぜそれを `<form>` に期待するのかの方に考察の余地がある、というものだ。

PUT はざっくり言えば「この URL にこのペイロードを置く(PUT)する」というものだ。しかし、 `<form>` でできるのは `application/x-www-form-urlencoded` と `multipart/form-data` だけであり、こうしたペイロードをそのままサーバに置きたいユースケースはないだろう。

一方 DELETE は「この URL のリソースを削除する」という用途だ。 `<form>` はそもそもペイロードを送るためのものであるため、その時点で齟齬がある。仮に GET のようにクエリを `<input>` で付与し DELETE リクエストしたとしても、 DELETE は基本的にレスポンス Body を想定しない。しかし、 `<form>` はブラウザにとって Navigation のトリガーであるため、 202 や 204 のようなレスポンスに対するブラウザは何をすればいいのかという問題になる。

結局、全て POST のユースケースでカバーできているのだ。


## 「でも〜」となぜ言いたくなるのか

ここまでの説明をみて、「でも〜」と思った人も多いかもしれない。最初の Hixie のスレッドには、「でも〜」というレスポンスが非常に多くある。「こういうユースケースがカバーできるはずだ」「こう拡張すれば使えるだろう」みたいなものだ。

2011 年といえば、 REST にカブれた人たちが Rails で `<form method=post>` に `<input type=hidden name=_method value=delete>` を隠していた時代だ。なんで自分たちが思い描く理想を今の HTML は体現していないのかという気持ちはわからなくもない。

確かに REST は HTTP のユースケースとしての側面を開発者にわかりやすく説明していたし、 Rails はそれを納得感のある形でまとめ上げていた。

一方で HTML の `<form>` は、ブラウザという「閲覧するため」のプラットフォームに、サーバとのインタラクションを与え「Web ページ」を「Web アプリケーション」に拡張する礎となった部品だ。 Web の歴史においてもかなり早い段階に登場したものであるが、ユーザがインタラクトしている対象はリソースではなくサーバだという点では、直感的で必要十分だったと言えるだろう。

REST 信者が見ている理想的な HTTP の世界と、世界で何億人ものユーザが操作する UI のための HTML の間にこの齟齬があるのは確かだ。

HTML の `<form>` で PUT や DELETE をサポートしたい開発者のモチベーションは、決してユーザのためではなく、自分の信じる理想の体現であることがほとんどだ。その証拠に、 PUT や DELETE ができないことによるユーザにとっての「問題」は特に発生していない。発生しているのは開発者の一時的な欲求不満くらいだ。解決すべき問題が発生してないところに「これが正しい姿だ」と提案された X-Form も、ブラウザベンダをはじめとして誰も参加しない状態での作業を経て作成され、見向きもされずに消えていった。当時「正しさ」が絶対評価だと思っている人は XHTML に傾倒していた、しかし、実際にユーザと対峙しているブラウザベンダは「絶対評価の正しさ」が存在するなどと思っていなかった。「誰の何の問題を解決するためなのか」が説明されてない正しさは幻想であり、 X-Form は幻想を求めた最後の亡骸だったと思う。

ということをあまりちゃんと説明せずに Shut-up してしまうのが Hixie という男でもある。が、彼の抱えていたワークの量を考えれば、何人かの幻想に付き合って結論が見えている議論をする暇はなかったんだろう。


## 問題は HTML か HTTP か

彼は、こんな話もしていた。

多くの開発者は `<form>` に HTTP メソッドが足りないと騒いでおり、まるで HTML の仕様に欠損があると考えていたが、彼にとって問題があるのは HTTP の方だった。

「もし 1990 年当時の Tim にアドバイスできたなら、 HTTP をもっともっとシンプルにし、アプリケーションプロトコルはその上に載せるように言う」と言う話をしていた。

ご存じのとおり HTML5 以降の Web は、 `<form>` を直接 Submit することがどんどん減っていった。開発者がやっているのは部品としての `<input>` だけ配置し、 JS で入力値をフックしたら、 HTTP を POST で固定た上に GraphQL を流すような作りが増えていく。

HTTP が今のセマンティクスになったからこそ、それを正しく使いこなすという意味で REST には価値があった。 HTTP をトランスポートとしてしか見ていなかったために、そのポテンシャルを引き出せなかった SOAP 派(これもまた XML に幻想を抱きすぎた人たちの亡骸だ)に対する継承でもあった。そして、それは一定の説得力があり、実際に SOAP の時代と比べれば HTTP はだいぶ正しく使われるようになった点で、開発者に「HTTP のセマンティクス」という存在を意識させる上で、かなりの価値はあっただろう。

一方、後に出てきた GraphQL をはじめとする RPC 派の開発者の常套句は、 REST を踏まえての「HTTP のメソッドじゃ足りない」だった。正確に言えば、基本的に CRUD が揃っているモデリング手法(当時でいう SOA)で、足りないというのは単にモデリングの失敗でしかない。モデリングは「世界をそのモデルで表す」という決め事なので、「モデル化できない」というのは「そのモデルが使いこなせなかった」でしかないだ。ただ、その「モデルがユースケースにマッチしているか」は別の話だ。 HTTP はステートレスだったため、モデルに落とし込んだ際に、それを現実にトランザクションとして実行する際にはラウンドトリップの問題が出てくる。

ここでモデル自体に欠点があったと決めつけたがる人も多くいるが、もし出てきた時の Web がこうでなかったら、今ここまで広まっていない点でその指摘もナンセンスだ。おそらく 20 年前なら SOAP をありがたがり、 XHTML を信仰して、全ての予定が崩れて Web を去っていったタイプの人たちと同じく「正しさの絶対値」に支配されていただろう。

もし、このモデルを拡張しようとして HTTP に手を入れ、そこに追従するように `<form>` を拡張していっても、複雑だけど完璧で誰も使わない仕様が、俗にいう技術的な負債として残っていた可能性の方が高い。 Hixie が Shut-up せずにダラダラと議論し続け、 SPA 時代に入って誰も興味を持たなくなって廃れるまで Hixie の稼働を拘束していたら、その損失は計り知れなかっただろう。

そして、その不毛な議論を収拾し、彼が当時の Tim にしたかったアドバイスを実現したのがまさしく WebSocket だった。

HTTP によって取得されたドキュメントの上で、 `<form>` を介したユーザインタラクションの結果を、任意のアプリケーションロジックに乗せるための部品として、現代に渡って彼の思惑通り使われている。


## より開発者の裁量を増やす世界

Ajax 以降、アプリケーションプラットフォームとしての道を歩み続けた Web は、 HTML5 以降もあらゆる機能を拡張して今に至る。

互換性を重視する性質上、今でも我々は HTTP と HTML と CSS と JS の延長で、文書閲覧で始まったころは想定もされていなかった複雑な UI を、当時の最高峰のスペックが今の時計にすら足元にも及ばないデバイススペックの時代に、 IPv4 でも十分だと考えていた人たちが想像もできないような数のユーザに対して、アプリケーションを作り続けている。

このまま HTML を拡張し続けるよりも、たとえば全てを Canvas にし、その上で任意の UI Library を用いて、開発者の裁量で好きな UI を実装できるようにした方が、変化するユースケースに対応してスケールしていける。そして、彼は HTML を離れ Flutter を始めて今に至る。

HTML ではなく Canvas で実装し、開発者は

しかし `<form>` は十分にその責務を果たし実際にワークしている。