(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[20],{sQ8o:function(a,e,t){"use strict";t.r(e);var n=t("p0pE"),r=t.n(n),s=(t("miYZ"),t("tsqr")),o=t("d6i3"),c=t.n(o),i=t("3a4m"),l=t.n(i),u=t("pnFo"),p=t("oGm8"),d=t("9gqE");e["default"]={namespace:u["f"],state:{init:{flowCategory:[]},model:{list:[],pagination:{}},manager:{list:[],pagination:{}},follow:{list:[],pagination:{}}},effects:{fetchInit:c.a.mark(function a(e,t){var n,r,s,o;return c.a.wrap(function(a){while(1)switch(a.prev=a.next){case 0:return n=e.payload,r=t.call,s=t.put,a.next=4,r(d["b"],n);case 4:if(o=a.sent,!o.success){a.next=8;break}return a.next=8,s({type:"saveInit",payload:{flowCategory:o.data}});case 8:case"end":return a.stop()}},a)}),fetchModelList:c.a.mark(function a(e,t){var n,r,s,o;return c.a.wrap(function(a){while(1)switch(a.prev=a.next){case 0:return n=e.payload,r=t.call,s=t.put,a.next=4,r(p["h"],n);case 4:if(o=a.sent,!o.success){a.next=8;break}return a.next=8,s({type:"saveModelList",payload:{list:o.data.records,pagination:{total:o.data.total,current:o.data.current,pageSize:o.data.size}}});case 8:case"end":return a.stop()}},a)}),fetchManagerList:c.a.mark(function a(e,t){var n,r,s,o;return c.a.wrap(function(a){while(1)switch(a.prev=a.next){case 0:return n=e.payload,r=t.call,s=t.put,a.next=4,r(p["g"],n);case 4:if(o=a.sent,!o.success){a.next=8;break}return a.next=8,s({type:"saveManagerList",payload:{list:o.data.records,pagination:{total:o.data.total,current:o.data.current,pageSize:o.data.size}}});case 8:case"end":return a.stop()}},a)}),fetchFollowList:c.a.mark(function a(e,t){var n,r,s,o;return c.a.wrap(function(a){while(1)switch(a.prev=a.next){case 0:return n=e.payload,r=t.call,s=t.put,a.next=4,r(p["f"],n);case 4:if(o=a.sent,!o.success){a.next=8;break}return a.next=8,s({type:"saveFollowList",payload:{list:o.data.records,pagination:{total:o.data.total,current:o.data.current,pageSize:o.data.size}}});case 8:case"end":return a.stop()}},a)}),deployUpload:c.a.mark(function a(e,t){var n,r,o;return c.a.wrap(function(a){while(1)switch(a.prev=a.next){case 0:return n=e.payload,r=t.call,a.next=4,r(p["e"],n);case 4:o=a.sent,o.success&&(s["a"].success("\u90e8\u7f72\u6210\u529f"),l.a.push("/flow/manager"));case 6:case"end":return a.stop()}},a)})},reducers:{saveInit:function(a,e){return r()({},a,{init:e.payload})},saveModelList:function(a,e){return r()({},a,{model:e.payload})},saveManagerList:function(a,e){return r()({},a,{manager:e.payload})},saveFollowList:function(a,e){return r()({},a,{follow:e.payload})}}}}}]);