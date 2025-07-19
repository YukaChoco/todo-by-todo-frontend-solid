// moO	>	ポインタをインクリメント
// mOo	<	ポインタをデクリメント
// MoO	+	ポインタの指す値をインクリメント
// MOo	-	ポインタの指す値をデクリメント
// oom	,	入力から1バイトをポインタの指す値に代入
// OOM	.	ポインタの指す値をASCII文字として出力
// MOO	[	ポインタの指す値が0なら、対応する「moo」にジャンプ
// moo	]	ポインタの指す値が非0なら、対応する「MOO」にジャンプ
// mOO	なし	ポインタの指す値を特定の命令として実行（3は無効）
// OOO	なし	ポインタの指す値に0を代入
// MMM	なし	レジスタに現在の値がない場合には現在のポインタの指す値をコピー。レジスタに値がある場合は、その値を現在のポインタの指す値に代入し、レジスタをクリアする
// Moo	なし	ポインタの指す値が0なら「oom」、非0ならば「OOM」を実行

// 文字列の入力を受け取って、その文字列を出力するプログラム
// ,[>,] <[.<]

export const cowProgramsWatnow: string = `
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO Moo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo Moo
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO Moo
MOo MOo MOo MOo MOo MOo Moo
MoO Moo
MoO MoO MoO MoO MoO MoO MoO MoO Moo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo Moo
`;

export const cowPrograms: string = `
000 moO
oom
moO oom

MOO

MOO
MOo mOo MoO moO
moo

oom

moo

mOo

OOM

mOo
`;

export const cowProgramsKottideyaritai: string = `
// h = 104
OOO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO Moo

// s = 115 | 115 - 104 = 11
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO Moo

// l = 108 | 108 - 115 = -7
MOo MOo MOo MOo MOo MOo MOo Moo

// ( = 40 | 40 - 108 = -68
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo MOo MOo Moo


moO
000 moO
oom
moO oom

MOO

MOO
MOo mOo MoO moO
moo

oom

moo

mOo

OOM

mOo mOo


// ' ' = 32 | 32 - 40 = -8
MOo MOo MOo MOo MOo MOo MOo MOo Moo

// '9' = 57 | 57 - 32 = 25
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO Moo

// '0' = 48 | 48 - 57 = -9
MOo MOo MOo MOo MOo MOo MOo MOo MOo Moo

// '%' = 37 | 37 - 48 = -11
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo Moo

// ' ' = 32 | 32 - 37 = -5
MOo MOo MOo MOo MOo Moo

// '8' = 56 | 56 - 32 = 24
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO MoO MoO MoO MoO MoO MoO
MoO MoO MoO MoO Moo

// '5' = 53 | 53 - 56 = -3
MOo MOo MOo Moo

// '%' = 37 | 37 - 53 = -16
MOo MOo MOo MOo MOo MOo MOo MOo MOo MOo
MOo MOo MOo MOo MOo MOo Moo

// ')' = 41 | 41 - 37 = 4
MoO MoO MoO MoO Moo
`;
