/**
 * jQuery placeholder Plugins
 * version 1.0              2014.09.25戈志刚
 */
(function(h, j, e) {

    var k = e.fn;
    var d = e.valHooks;
    var b = e.propHooks;
    var m;
    var l;

    l = k.placeholder = function() {
        var n = this;
        n.filter((false ? "textarea" : ":input") + "[placeholder]").not(".placeholder").bind({
            "focus.placeholder": c,
            "blur.placeholder": g
        }).data("placeholder-enabled", true).trigger("blur.placeholder");
        return n
    };

    m = {
        get: function(o) {
            var n = e(o);
            var p = n.data("placeholder-password");
            if (p) {
                return p[0].value
            }
            return n.data("placeholder-enabled") && n.hasClass("placeholder") ? "" : o.value
        },
        set: function(o, q) {
            var n = e(o);
            var p = n.data("placeholder-password");
            if (p) {
                return p[0].value = q
            }
            if (!n.data("placeholder-enabled")) {
                return o.value = q
            }
            if (q == "") {
                o.value = q;
                if (o != j.activeElement) {
                    g.call(o)
                }
            } else {
                if (n.hasClass("placeholder")) {
                    c.call(o, true, q) || (o.value = q)
                } else {
                    o.value = q
                }
            }
            return n
        }
    };

    d.input = m;
    b.value = m
    d.textarea = m;

    e(function() {
        e(j).delegate("form", "submit.placeholder", function() {
            var n = e(".placeholder", this).each(c);
            setTimeout(function() {
                n.each(g)
            }, 10)
        })
    });
//  e(h).bind("beforeunload.placeholder", function() {
//    e(".placeholder").each(function() {
//      this.value = ""
//    })
//  })

    function i(o) {
        var n = {};
        var p = /^jQuery\d+$/;
        e.each(o.attributes, function(r, q) {
            if (q.specified && !p.test(q.name)) {
                n[q.name] = q.value
            }
        });
        return n
    }

    function c(o, p) {
        var n = this;
        var q = e(n);
        if (n.value == q.attr("placeholder") && q.hasClass("placeholder")) {
            if (q.data("placeholder-password")) {
                q = q.hide().next().show().attr("id", q.removeAttr("id").data("placeholder-id"));
                if (o === true) {
                    return q[0].value = p
                }
                q.focus()
            } else {
                n.value = "";
                q.removeClass("placeholder");
                //n == j.activeElement && n.select()
            }
        }
    }

    function g() {
        var r;
        var n = this;
        var q = e(n);
        var p = this.id;
        if (n.value == "") {
            if (n.type == "password") {
                if (!q.data("placeholder-textinput")) {
                    try {
                        r = q.clone().attr({
                            type: "text"
                        })
                    } catch (o) {
                        r = e("<input>").attr(e.extend(i(this), {
                            type: "text"
                        }))
                    }
                    r.removeAttr("name").data({
                        "placeholder-password": q,
                        "placeholder-id": p
                    }).bind("focus.placeholder", c);
                    q.data({
                        "placeholder-textinput": r,
                        "placeholder-id": p
                    }).before(r)
                }
                q = q.removeAttr("id").hide().prev().attr("id", p).show()
            }
            q.addClass("placeholder");
            q[0].value = q.attr("placeholder");
        } else if (n.value == q.attr("placeholder") && q.hasClass("placeholder")) {
            return;
        }else{
            q.removeClass("placeholder")
        }
    }
}(this, document, jQuery));