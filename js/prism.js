/* PrismJS 1.9.0
http://prismjs.com/download.html?themes=prism-okaidia&languages=markup+css+clike+javascript+c+cpp+objectivec+python+swift&plugins=line-numbers+toolbar+show-language */
var _self = "undefined" != typeof window ? window : "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? self : {},
	Prism = function() {
		var e = /\blang(?:uage)?-(\w+)\b/i,
			t = 0,
			n = _self.Prism = {
				manual: _self.Prism && _self.Prism.manual,
				disableWorkerMessageHandler: _self.Prism && _self.Prism.disableWorkerMessageHandler,
				util: {
					encode: function(e) {
						return e instanceof r ? new r(e.type, n.util.encode(e.content), e.alias) : "Array" === n.util.type(e) ? e.map(n.util.encode) : e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\u00a0/g, " ")
					},
					type: function(e) {
						return Object.prototype.toString.call(e).match(/\[object (\w+)\]/)[1]
					},
					objId: function(e) {
						return e.__id || Object.defineProperty(e, "__id", {
							value: ++t
						}), e.__id
					},
					clone: function(e) {
						var t = n.util.type(e);
						switch (t) {
							case "Object":
								var r = {};
								for (var a in e) e.hasOwnProperty(a) && (r[a] = n.util.clone(e[a]));
								return r;
							case "Array":
								return e.map(function(e) {
									return n.util.clone(e)
								})
						}
						return e
					}
				},
				languages: {
					extend: function(e, t) {
						var r = n.util.clone(n.languages[e]);
						for (var a in t) r[a] = t[a];
						return r
					},
					insertBefore: function(e, t, r, a) {
						a = a || n.languages;
						var l = a[e];
						if (2 == arguments.length) {
							r = arguments[1];
							for (var i in r) r.hasOwnProperty(i) && (l[i] = r[i]);
							return l
						}
						var o = {};
						for (var s in l)
							if (l.hasOwnProperty(s)) {
								if (s == t)
									for (var i in r) r.hasOwnProperty(i) && (o[i] = r[i]);
								o[s] = l[s]
							}
						return n.languages.DFS(n.languages, function(t, n) {
							n === a[e] && t != e && (this[t] = o)
						}), a[e] = o
					},
					DFS: function(e, t, r, a) {
						a = a || {};
						for (var l in e) e.hasOwnProperty(l) && (t.call(e, l, e[l], r || l), "Object" !== n.util.type(e[l]) || a[n.util.objId(e[l])] ? "Array" !== n.util.type(e[l]) || a[n.util.objId(e[l])] || (a[n.util.objId(e[l])] = !0, n.languages.DFS(e[l], t, l, a)) : (a[n.util.objId(e[l])] = !0, n.languages.DFS(e[l], t, null, a)))
					}
				},
				plugins: {},
				highlightAll: function(e, t) {
					n.highlightAllUnder(document, e, t)
				},
				highlightAllUnder: function(e, t, r) {
					var a = {
						callback: r,
						selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
					};
					n.hooks.run("before-highlightall", a);
					for (var l, i = a.elements || e.querySelectorAll(a.selector), o = 0; l = i[o++];) n.highlightElement(l, t === !0, a.callback)
				},
				highlightElement: function(t, r, a) {
					for (var l, i, o = t; o && !e.test(o.className);) o = o.parentNode;
					o && (l = (o.className.match(e) || [, ""])[1].toLowerCase(), i = n.languages[l]), t.className = t.className.replace(e, "").replace(/\s+/g, " ") + " language-" + l, t.parentNode && (o = t.parentNode, /pre/i.test(o.nodeName) && (o.className = o.className.replace(e, "").replace(/\s+/g, " ") + " language-" + l));
					var s = t.textContent,
						g = {
							element: t,
							language: l,
							grammar: i,
							code: s
						};
					if (n.hooks.run("before-sanity-check", g), !g.code || !g.grammar) return g.code && (n.hooks.run("before-highlight", g), g.element.textContent = g.code, n.hooks.run("after-highlight", g)), n.hooks.run("complete", g), void 0;
					if (n.hooks.run("before-highlight", g), r && _self.Worker) {
						var u = new Worker(n.filename);
						u.onmessage = function(e) {
							g.highlightedCode = e.data, n.hooks.run("before-insert", g), g.element.innerHTML = g.highlightedCode, a && a.call(g.element), n.hooks.run("after-highlight", g), n.hooks.run("complete", g)
						}, u.postMessage(JSON.stringify({
							language: g.language,
							code: g.code,
							immediateClose: !0
						}))
					} else g.highlightedCode = n.highlight(g.code, g.grammar, g.language), n.hooks.run("before-insert", g), g.element.innerHTML = g.highlightedCode, a && a.call(t), n.hooks.run("after-highlight", g), n.hooks.run("complete", g)
				},
				highlight: function(e, t, a) {
					var l = n.tokenize(e, t);
					return r.stringify(n.util.encode(l), a)
				},
				matchGrammar: function(e, t, r, a, l, i, o) {
					var s = n.Token;
					for (var g in r)
						if (r.hasOwnProperty(g) && r[g]) {
							if (g == o) return;
							var u = r[g];
							u = "Array" === n.util.type(u) ? u : [u];
							for (var c = 0; c < u.length; ++c) {
								var h = u[c],
									f = h.inside,
									d = !!h.lookbehind,
									m = !!h.greedy,
									p = 0,
									y = h.alias;
								if (m && !h.pattern.global) {
									var v = h.pattern.toString().match(/[imuy]*$/)[0];
									h.pattern = RegExp(h.pattern.source, v + "g")
								}
								h = h.pattern || h;
								for (var b = a, k = l; b < t.length; k += t[b].length, ++b) {
									var w = t[b];
									if (t.length > e.length) return;
									if (!(w instanceof s)) {
										h.lastIndex = 0;
										var _ = h.exec(w),
											P = 1;
										if (!_ && m && b != t.length - 1) {
											if (h.lastIndex = k, _ = h.exec(e), !_) break;
											for (var A = _.index + (d ? _[1].length : 0), j = _.index + _[0].length, x = b, O = k, N = t.length; N > x && (j > O || !t[x].type && !t[x - 1].greedy); ++x) O += t[x].length, A >= O && (++b, k = O);
											if (t[b] instanceof s || t[x - 1].greedy) continue;
											P = x - b, w = e.slice(k, O), _.index -= k
										}
										if (_) {
											d && (p = _[1].length);
											var A = _.index + p,
												_ = _[0].slice(p),
												j = A + _.length,
												S = w.slice(0, A),
												C = w.slice(j),
												M = [b, P];
											S && (++b, k += S.length, M.push(S));
											var E = new s(g, f ? n.tokenize(_, f) : _, y, _, m);
											if (M.push(E), C && M.push(C), Array.prototype.splice.apply(t, M), 1 != P && n.matchGrammar(e, t, r, b, k, !0, g), i) break
										} else if (i) break
									}
								}
							}
						}
				},
				tokenize: function(e, t) {
					var r = [e],
						a = t.rest;
					if (a) {
						for (var l in a) t[l] = a[l];
						delete t.rest
					}
					return n.matchGrammar(e, r, t, 0, 0, !1), r
				},
				hooks: {
					all: {},
					add: function(e, t) {
						var r = n.hooks.all;
						r[e] = r[e] || [], r[e].push(t)
					},
					run: function(e, t) {
						var r = n.hooks.all[e];
						if (r && r.length)
							for (var a, l = 0; a = r[l++];) a(t)
					}
				}
			},
			r = n.Token = function(e, t, n, r, a) {
				this.type = e, this.content = t, this.alias = n, this.length = 0 | (r || "").length, this.greedy = !!a
			};
		if (r.stringify = function(e, t, a) {
				if ("string" == typeof e) return e;
				if ("Array" === n.util.type(e)) return e.map(function(n) {
					return r.stringify(n, t, e)
				}).join("");
				var l = {
					type: e.type,
					content: r.stringify(e.content, t, a),
					tag: "span",
					classes: ["token", e.type],
					attributes: {},
					language: t,
					parent: a
				};
				if (e.alias) {
					var i = "Array" === n.util.type(e.alias) ? e.alias : [e.alias];
					Array.prototype.push.apply(l.classes, i)
				}
				n.hooks.run("wrap", l);
				var o = Object.keys(l.attributes).map(function(e) {
					return e + '="' + (l.attributes[e] || "").replace(/"/g, "&quot;") + '"'
				}).join(" ");
				return "<" + l.tag + ' class="' + l.classes.join(" ") + '"' + (o ? " " + o : "") + ">" + l.content + "</" + l.tag + ">"
			}, !_self.document) return _self.addEventListener ? (n.disableWorkerMessageHandler || _self.addEventListener("message", function(e) {
			var t = JSON.parse(e.data),
				r = t.language,
				a = t.code,
				l = t.immediateClose;
			_self.postMessage(n.highlight(a, n.languages[r], r)), l && _self.close()
		}, !1), _self.Prism) : _self.Prism;
		var a = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();
		return a && (n.filename = a.src, n.manual || a.hasAttribute("data-manual") || ("loading" !== document.readyState ? window.requestAnimationFrame ? window.requestAnimationFrame(n.highlightAll) : window.setTimeout(n.highlightAll, 16) : document.addEventListener("DOMContentLoaded", n.highlightAll))), _self.Prism
	}();
"undefined" != typeof module && module.exports && (module.exports = Prism), "undefined" != typeof global && (global.Prism = Prism);
Prism.languages.markup = {
	comment: /<!--[\s\S]*?-->/,
	prolog: /<\?[\s\S]+?\?>/,
	doctype: /<!DOCTYPE[\s\S]+?>/i,
	cdata: /<!\[CDATA\[[\s\S]*?]]>/i,
	tag: {
		pattern: /<\/?(?!\d)[^\s>\/=$<]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
		inside: {
			tag: {
				pattern: /^<\/?[^\s>\/]+/i,
				inside: {
					punctuation: /^<\/?/,
					namespace: /^[^\s>\/:]+:/
				}
			},
			"attr-value": {
				pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
				inside: {
					punctuation: [/^=/, {
						pattern: /(^|[^\\])["']/,
						lookbehind: !0
					}]
				}
			},
			punctuation: /\/?>/,
			"attr-name": {
				pattern: /[^\s>\/]+/,
				inside: {
					namespace: /^[^\s>\/:]+:/
				}
			}
		}
	},
	entity: /&#?[\da-z]{1,8};/i
}, Prism.languages.markup.tag.inside["attr-value"].inside.entity = Prism.languages.markup.entity, Prism.hooks.add("wrap", function(a) {
	"entity" === a.type && (a.attributes.title = a.content.replace(/&amp;/, "&"))
}), Prism.languages.xml = Prism.languages.markup, Prism.languages.html = Prism.languages.markup, Prism.languages.mathml = Prism.languages.markup, Prism.languages.svg = Prism.languages.markup;
Prism.languages.css = {
	comment: /\/\*[\s\S]*?\*\//,
	atrule: {
		pattern: /@[\w-]+?.*?(?:;|(?=\s*\{))/i,
		inside: {
			rule: /@[\w-]+/
		}
	},
	url: /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
	selector: /[^{}\s][^{};]*?(?=\s*\{)/,
	string: {
		pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: !0
	},
	property: /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
	important: /\B!important\b/i,
	"function": /[-a-z0-9]+(?=\()/i,
	punctuation: /[(){};:]/
}, Prism.languages.css.atrule.inside.rest = Prism.util.clone(Prism.languages.css), Prism.languages.markup && (Prism.languages.insertBefore("markup", "tag", {
	style: {
		pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
		lookbehind: !0,
		inside: Prism.languages.css,
		alias: "language-css",
		greedy: !0
	}
}), Prism.languages.insertBefore("inside", "attr-value", {
	"style-attr": {
		pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
		inside: {
			"attr-name": {
				pattern: /^\s*style/i,
				inside: Prism.languages.markup.tag.inside
			},
			punctuation: /^\s*=\s*['"]|['"]\s*$/,
			"attr-value": {
				pattern: /.+/i,
				inside: Prism.languages.css
			}
		},
		alias: "language-css"
	}
}, Prism.languages.markup.tag));
Prism.languages.clike = {
	comment: [{
		pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
		lookbehind: !0
	}, {
		pattern: /(^|[^\\:])\/\/.*/,
		lookbehind: !0
	}],
	string: {
		pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: !0
	},
	"class-name": {
		pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
		lookbehind: !0,
		inside: {
			punctuation: /[.\\]/
		}
	},
	keyword: /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
	"boolean": /\b(?:true|false)\b/,
	"function": /[a-z0-9_]+(?=\()/i,
	number: /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)\b/i,
	operator: /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
	punctuation: /[{}[\];(),.:]/
};
Prism.languages.clike={comment:[{pattern:/(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,lookbehind:!0},{pattern:/(^|[^\\:])\/\/.*/,lookbehind:!0,greedy:!0}],string:{pattern:/(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,greedy:!0},"class-name":{pattern:/((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,lookbehind:!0,inside:{punctuation:/[.\\]/}},keyword:/\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,"boolean":/\b(?:true|false)\b/,"function":/\w+(?=\()/,number:/\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,operator:/--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,punctuation:/[{}[\];(),.:]/};
!function(a){var e=/\b(?:abstract|continue|for|new|switch|assert|default|goto|package|synchronized|boolean|do|if|private|this|break|double|implements|protected|throw|byte|else|import|public|throws|case|enum|instanceof|return|transient|catch|extends|int|short|try|char|final|interface|static|void|class|finally|long|strictfp|volatile|const|float|native|super|while|var|null|exports|module|open|opens|provides|requires|to|transitive|uses|with)\b/,t=/\b[A-Z](?:\w*[a-z]\w*)?\b/;a.languages.java=a.languages.extend("clike",{"class-name":[t,/\b[A-Z]\w*(?=\s+\w+\s*[;,=())])/],keyword:e,"function":[a.languages.clike.function,{pattern:/(\:\:)[a-z_]\w*/,lookbehind:!0}],number:/\b0b[01][01_]*L?\b|\b0x[\da-f_]*\.?[\da-f_p+-]+\b|(?:\b\d[\d_]*\.?[\d_]*|\B\.\d[\d_]*)(?:e[+-]?\d[\d_]*)?[dfl]?/i,operator:{pattern:/(^|[^.])(?:<<=?|>>>?=?|->|([-+&|])\2|[?:~]|[-+*\/%&|^!=<>]=?)/m,lookbehind:!0}}),a.languages.insertBefore("java","class-name",{annotation:{alias:"punctuation",pattern:/(^|[^.])@\w+/,lookbehind:!0},namespace:{pattern:/(\b(?:exports|import(?:\s+static)?|module|open|opens|package|provides|requires|to|transitive|uses|with)\s+)[a-z]\w*(\.[a-z]\w*)+/,lookbehind:!0,inside:{punctuation:/\./}},generics:{pattern:/<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<(?:[\w\s,.&?]|<[\w\s,.&?]*>)*>)*>)*>/,inside:{"class-name":t,keyword:e,punctuation:/[<>(),.:]/,operator:/[?&|]/}}})}(Prism);
Prism.languages.javascript = Prism.languages.extend("clike", {
	keyword: /\b(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)\b/,
	number: /\b-?(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+|\d*\.?\d+(?:[Ee][+-]?\d+)?|NaN|Infinity)\b/,
	"function": /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\()/i,
	operator: /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
}), Prism.languages.insertBefore("javascript", "keyword", {
	regex: {
		pattern: /(^|[^\/])\/(?!\/)(\[[^\]\r\n]+]|\\.|[^\/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/,
		lookbehind: !0,
		greedy: !0
	},
	"function-variable": {
		pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=\s*(?:function\b|(?:\([^()]*\)|[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/i,
		alias: "function"
	}
}), Prism.languages.insertBefore("javascript", "string", {
	"template-string": {
		pattern: /`(?:\\[\s\S]|[^\\`])*`/,
		greedy: !0,
		inside: {
			interpolation: {
				pattern: /\$\{[^}]+\}/,
				inside: {
					"interpolation-punctuation": {
						pattern: /^\$\{|\}$/,
						alias: "punctuation"
					},
					rest: Prism.languages.javascript
				}
			},
			string: /[\s\S]+/
		}
	}
}), Prism.languages.markup && Prism.languages.insertBefore("markup", "tag", {
	script: {
		pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
		lookbehind: !0,
		inside: Prism.languages.javascript,
		alias: "language-javascript",
		greedy: !0
	}
}), Prism.languages.js = Prism.languages.javascript;
! function(a) {
	var e = a.util.clone(a.languages.javascript);
	a.languages.jsx = a.languages.extend("markup", e), a.languages.jsx.tag.pattern = /<\/?[\w.:-]+\s*(?:\s+(?:[\w.:-]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+|(?:\{\{?[^}]*\}?\})))?|\{\.{3}[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\}))*\s*\/?>/i, a.languages.jsx.tag.inside["attr-value"].pattern = /=(?!\{)(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">]+)/i, a.languages.insertBefore("inside", "attr-name", {
		spread: {
			pattern: /\{\.{3}[a-z_$][\w$]*(?:\.[a-z_$][\w$]*)*\}/,
			inside: {
				punctuation: /\.{3}|[{}.]/,
				"attr-value": /\w+/
			}
		}
	}, a.languages.jsx.tag);
	var s = a.util.clone(a.languages.jsx);
	delete s.punctuation, s = a.languages.insertBefore("jsx", "operator", {
		punctuation: /=(?={)|[{}[\];(),.:]/
	}, {
		jsx: s
	}), a.languages.insertBefore("inside", "attr-value", {
		script: {
			pattern: /=(\{(?:\{[^}]*\}|[^}])+\})/i,
			inside: s,
			alias: "language-javascript"
		}
	}, a.languages.jsx.tag)
}(Prism);
Prism.languages.c = Prism.languages.extend("clike", {
	keyword: /\b(?:_Alignas|_Alignof|_Atomic|_Bool|_Complex|_Generic|_Imaginary|_Noreturn|_Static_assert|_Thread_local|asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/,
	operator: /-[>-]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/]/,
	number: /\b-?(?:0x[\da-f]+|\d*\.?\d+(?:e[+-]?\d+)?)[ful]*\b/i
}), Prism.languages.insertBefore("c", "string", {
	macro: {
		pattern: /(^\s*)#\s*[a-z]+(?:[^\r\n\\]|\\(?:\r\n|[\s\S]))*/im,
		lookbehind: !0,
		alias: "property",
		inside: {
			string: {
				pattern: /(#\s*include\s*)(?:<.+?>|("|')(?:\\?.)+?\2)/,
				lookbehind: !0
			},
			directive: {
				pattern: /(#\s*)\b(?:define|defined|elif|else|endif|error|ifdef|ifndef|if|import|include|line|pragma|undef|using)\b/,
				lookbehind: !0,
				alias: "keyword"
			}
		}
	},
	constant: /\b(?:__FILE__|__LINE__|__DATE__|__TIME__|__TIMESTAMP__|__func__|EOF|NULL|SEEK_CUR|SEEK_END|SEEK_SET|stdin|stdout|stderr)\b/
}), delete Prism.languages.c["class-name"], delete Prism.languages.c["boolean"];
Prism.languages.cpp = Prism.languages.extend("c", {
	keyword: /\b(?:alignas|alignof|asm|auto|bool|break|case|catch|char|char16_t|char32_t|class|compl|const|constexpr|const_cast|continue|decltype|default|delete|do|double|dynamic_cast|else|enum|explicit|export|extern|float|for|friend|goto|if|inline|int|long|mutable|namespace|new|noexcept|nullptr|operator|private|protected|public|register|reinterpret_cast|return|short|signed|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|unsigned|using|virtual|void|volatile|wchar_t|while)\b/,
	"boolean": /\b(?:true|false)\b/,
	operator: /--?|\+\+?|!=?|<{1,2}=?|>{1,2}=?|->|:{1,2}|={1,2}|\^|~|%|&{1,2}|\|\|?|\?|\*|\/|\b(?:and|and_eq|bitand|bitor|not|not_eq|or|or_eq|xor|xor_eq)\b/
}), Prism.languages.insertBefore("cpp", "keyword", {
	"class-name": {
		pattern: /(class\s+)\w+/i,
		lookbehind: !0
	}
});
Prism.languages.objc = Prism.languages.extend("c", {
	keyword: /\b(?:asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|in|self|super)\b|(?:@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b/,
	string: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|@"(?:\\(?:\r\n|[\s\S])|[^"\\\r\n])*"/,
	operator: /-[->]?|\+\+?|!=?|<<?=?|>>?=?|==?|&&?|\|\|?|[~^%?*\/@]/
});
Prism.languages.python = {
	comment: {
		pattern: /(^|[^\\])#.*/,
		lookbehind: !0
	},
	"triple-quoted-string": {
		pattern: /("""|''')[\s\S]+?\1/,
		greedy: !0,
		alias: "string"
	},
	string: {
		pattern: /("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,
		greedy: !0
	},
	"function": {
		pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
		lookbehind: !0
	},
	"class-name": {
		pattern: /(\bclass\s+)\w+/i,
		lookbehind: !0
	},
	keyword: /\b(?:as|assert|async|await|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|nonlocal|pass|print|raise|return|try|while|with|yield)\b/,
	builtin: /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
	"boolean": /\b(?:True|False|None)\b/,
	number: /\b-?(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*\.?\d*|\.\d+)(?:e[+-]?\d+)?j?\b/i,
	operator: /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]|\b(?:or|and|not)\b/,
	punctuation: /[{}[\];(),.:]/
};
Prism.languages.swift = Prism.languages.extend("clike", {
	string: {
		pattern: /("|')(\\(?:\((?:[^()]|\([^)]+\))+\)|\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
		greedy: !0,
		inside: {
			interpolation: {
				pattern: /\\\((?:[^()]|\([^)]+\))+\)/,
				inside: {
					delimiter: {
						pattern: /^\\\(|\)$/,
						alias: "variable"
					}
				}
			}
		}
	},
	keyword: /\b(?:as|associativity|break|case|catch|class|continue|convenience|default|defer|deinit|didSet|do|dynamic(?:Type)?|else|enum|extension|fallthrough|final|for|func|get|guard|if|import|in|infix|init|inout|internal|is|lazy|left|let|mutating|new|none|nonmutating|operator|optional|override|postfix|precedence|prefix|private|Protocol|public|repeat|required|rethrows|return|right|safe|self|Self|set|static|struct|subscript|super|switch|throws?|try|Type|typealias|unowned|unsafe|var|weak|where|while|willSet|__(?:COLUMN__|FILE__|FUNCTION__|LINE__))\b/,
	number: /\b(?:[\d_]+(?:\.[\de_]+)?|0x[a-f0-9_]+(?:\.[a-f0-9p_]+)?|0b[01_]+|0o[0-7_]+)\b/i,
	constant: /\b(?:nil|[A-Z_]{2,}|k[A-Z][A-Za-z_]+)\b/,
	atrule: /@\b(?:IB(?:Outlet|Designable|Action|Inspectable)|class_protocol|exported|noreturn|NS(?:Copying|Managed)|objc|UIApplicationMain|auto_closure)\b/,
	builtin: /\b(?:[A-Z]\S+|abs|advance|alignof(?:Value)?|assert|contains|count(?:Elements)?|debugPrint(?:ln)?|distance|drop(?:First|Last)|dump|enumerate|equal|filter|find|first|getVaList|indices|isEmpty|join|last|lexicographicalCompare|map|max(?:Element)?|min(?:Element)?|numericCast|overlaps|partition|print(?:ln)?|reduce|reflect|reverse|sizeof(?:Value)?|sort(?:ed)?|split|startsWith|stride(?:of(?:Value)?)?|suffix|swap|toDebugString|toString|transcode|underestimateCount|unsafeBitCast|with(?:ExtendedLifetime|Unsafe(?:MutablePointers?|Pointers?)|VaList))\b/
}), Prism.languages.swift.string.inside.interpolation.inside.rest = Prism.util.clone(Prism.languages.swift);
Prism.languages.dart=Prism.languages.extend("clike",{string:[{pattern:/r?("""|''')[\s\S]*?\1/,greedy:!0},{pattern:/r?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/,greedy:!0}],keyword:[/\b(?:async|sync|yield)\*/,/\b(?:abstract|assert|async|await|break|case|catch|class|const|continue|default|deferred|do|dynamic|else|enum|export|external|extends|factory|final|finally|for|get|if|implements|import|in|library|new|null|operator|part|rethrow|return|set|static|super|switch|this|throw|try|typedef|var|void|while|with|yield)\b/],operator:/\bis!|\b(?:as|is)\b|\+\+|--|&&|\|\||<<=?|>>=?|~(?:\/=?)?|[+\-*\/%&^|=!<>]=?|\?/}),Prism.languages.insertBefore("dart","function",{metadata:{pattern:/@\w+/,alias:"symbol"}});
Prism.languages.json = {
	property: /"(?:\\.|[^\\"\r\n])*"(?=\s*:)/i,
	string: {
		pattern: /"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		greedy: !0
	},
	number: /\b-?(?:0x[\dA-Fa-f]+|\d*\.?\d+(?:[Ee][+-]?\d+)?)\b/,
	punctuation: /[{}[\]);,]/,
	operator: /:/g,
	"boolean": /\b(?:true|false)\b/i,
	"null": /\bnull\b/i
}, Prism.languages.jsonp = Prism.languages.json;
! function() {
	if ("undefined" != typeof self && self.Prism && self.document) {
		var e = "line-numbers",
			t = /\n(?!$)/g,
			n = function(e) {
				var n = r(e),
					s = n["white-space"];
				if ("pre-wrap" === s || "pre-line" === s) {
					var l = e.querySelector("code"),
						i = e.querySelector(".line-numbers-rows"),
						a = e.querySelector(".line-numbers-sizer"),
						o = l.textContent.split(t);
					a || (a = document.createElement("span"), a.className = "line-numbers-sizer", l.appendChild(a)), a.style.display = "block", o.forEach(function(e, t) {
						a.textContent = e || "\n";
						var n = a.getBoundingClientRect().height;
						i.children[t].style.height = n + "px"
					}), a.textContent = "", a.style.display = "none"
				}
			},
			r = function(e) {
				return e ? window.getComputedStyle ? getComputedStyle(e) : e.currentStyle || null : null
			};
		window.addEventListener("resize", function() {
			Array.prototype.forEach.call(document.querySelectorAll("pre." + e), n)
		}), Prism.hooks.add("complete", function(e) {
			if (e.code) {
				var r = e.element.parentNode,
					s = /\s*\bline-numbers\b\s*/;
				if (r && /pre/i.test(r.nodeName) && (s.test(r.className) || s.test(e.element.className)) && !e.element.querySelector(".line-numbers-rows")) {
					s.test(e.element.className) && (e.element.className = e.element.className.replace(s, " ")), s.test(r.className) || (r.className += " line-numbers");
					var l, i = e.code.match(t),
						a = i ? i.length + 1 : 1,
						o = new Array(a + 1);
					o = o.join("<span></span>"), l = document.createElement("span"), l.setAttribute("aria-hidden", "true"), l.className = "line-numbers-rows", l.innerHTML = o, r.hasAttribute("data-start") && (r.style.counterReset = "linenumber " + (parseInt(r.getAttribute("data-start"), 10) - 1)), e.element.appendChild(l), n(r), Prism.hooks.run("line-numbers", e)
				}
			}
		}), Prism.hooks.add("line-numbers", function(e) {
			e.plugins = e.plugins || {}, e.plugins.lineNumbers = !0
		}), Prism.plugins.lineNumbers = {
			getLine: function(t, n) {
				if ("PRE" === t.tagName && t.classList.contains(e)) {
					var r = t.querySelector(".line-numbers-rows"),
						s = parseInt(t.getAttribute("data-start"), 10) || 1,
						l = s + (r.children.length - 1);
					s > n && (n = s), n > l && (n = l);
					var i = n - s;
					return r.children[i]
				}
			}
		}
	}
}();
! function() {
	if ("undefined" != typeof self && self.Prism && self.document) {
		var t = [],
			e = {},
			n = function() {};
		Prism.plugins.toolbar = {};
		var a = Prism.plugins.toolbar.registerButton = function(n, a) {
				var o;
				o = "function" == typeof a ? a : function(t) {
					var e;
					return "function" == typeof a.onClick ? (e = document.createElement("button"), e.type = "button", e.addEventListener("click", function() {
						a.onClick.call(this, t)
					})) : "string" == typeof a.url ? (e = document.createElement("a"), e.href = a.url) : e = document.createElement("span"), e.textContent = a.text, e
				}, t.push(e[n] = o)
			},
			o = Prism.plugins.toolbar.hook = function(a) {
				var o = a.element.parentNode;
				if (o && /pre/i.test(o.nodeName) && !o.classList.contains("code-toolbar")) {
					o.classList.add("code-toolbar");
					var r = document.createElement("div");
					r.classList.add("toolbar"), document.body.hasAttribute("data-toolbar-order") && (t = document.body.getAttribute("data-toolbar-order").split(",").map(function(t) {
						return e[t] || n
					})), t.forEach(function(t) {
						var e = t(a);
						if (e) {
							var n = document.createElement("div");
							n.classList.add("toolbar-item"), n.appendChild(e), r.appendChild(n)
						}
					}), o.appendChild(r)
				}
			};
		a("label", function(t) {
			var e = t.element.parentNode;
			if (e && /pre/i.test(e.nodeName) && e.hasAttribute("data-label")) {
				var n, a, o = e.getAttribute("data-label");
				try {
					a = document.querySelector("template#" + o)
				} catch (r) {}
				return a ? n = a.content : (e.hasAttribute("data-url") ? (n = document.createElement("a"), n.href = e.getAttribute("data-url")) : n = document.createElement("span"), n.textContent = o), n
			}
		}), Prism.hooks.add("complete", o)
	}
}();
! function() {
	if ("undefined" != typeof self && self.Prism && self.document) {
		if (!Prism.plugins.toolbar) return console.warn("Show Languages plugin loaded before Toolbar plugin."), void 0;
		var e = {
			html: "HTML",
			xml: "XML",
			svg: "SVG",
			mathml: "MathML",
			css: "CSS",
			clike: "C-like",
			javascript: "JavaScript",
			abap: "ABAP",
			actionscript: "ActionScript",
			apacheconf: "Apache Configuration",
			apl: "APL",
			applescript: "AppleScript",
			asciidoc: "AsciiDoc",
			asm6502: "6502 Assembly",
			aspnet: "ASP.NET (C#)",
			autohotkey: "AutoHotkey",
			autoit: "AutoIt",
			basic: "BASIC",
			csharp: "C#",
			cpp: "C++",
			coffeescript: "CoffeeScript",
			"css-extras": "CSS Extras",
			django: "Django/Jinja2",
			fsharp: "F#",
			glsl: "GLSL",
			graphql: "GraphQL",
			http: "HTTP",
			ichigojam: "IchigoJam",
			inform7: "Inform 7",
			json: "JSON",
			latex: "LaTeX",
			livescript: "LiveScript",
			lolcode: "LOLCODE",
			matlab: "MATLAB",
			mel: "MEL",
			n4js: "N4JS",
			nasm: "NASM",
			nginx: "nginx",
			nsis: "NSIS",
			objectivec: "Objective-C",
			ocaml: "OCaml",
			opencl: "OpenCL",
			parigp: "PARI/GP",
			php: "PHP",
			"php-extras": "PHP Extras",
			powershell: "PowerShell",
			properties: ".properties",
			protobuf: "Protocol Buffers",
			jsx: "React JSX",
			renpy: "Ren'py",
			rest: "reST (reStructuredText)",
			sas: "SAS",
			sass: "Sass (Sass)",
			scss: "Sass (Scss)",
			sql: "SQL",
			typescript: "TypeScript",
			vbnet: "VB.Net",
			vhdl: "VHDL",
			vim: "vim",
			wiki: "Wiki markup",
			xojo: "Xojo (REALbasic)",
			yaml: "YAML"
		};
		Prism.plugins.toolbar.registerButton("show-language", function(t) {
			var a = t.element.parentNode;
			if (a && /pre/i.test(a.nodeName)) {
				var s = a.getAttribute("data-language") || e[t.language] || t.language.substring(0, 1).toUpperCase() + t.language.substring(1),
					i = document.createElement("span");
				return i.textContent = s, i
			}
		})
	}
}();


