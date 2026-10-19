/* Zenith · Judge.me helpers (v8) + review lists (v20) — same script as the landing page
   (lp.tryzenith.ph, v21 Oct 17, 2026). Loaded with assets/zenith-judgeme.css when Theme settings → Zenith →
   "Dark Judge.me review style" is on. Paste updates from the landing page into this file unchanged.
   1. Re-run Judge.me's card layout a few times after the reviews draw, so the
      gap under each card matches the gap beside it. No observers, and only on
      visible lists, so Judge.me's sort and paging are never touched.
   2. If a Judge.me review request fails (sort, filter, next page), retry it
      once with a fresh copy; if that fails too, hide the spinner and show the
      reviews again, so the widget is never stuck on loading.
   3. Review photos open only in Judge.me's own viewer, and closing it puts the page back
      instantly instead of gliding down from the top. */
(function(){
  var instantUntil=0, nativeScrollTo=window.scrollTo;
  window.scrollTo=function(x,y){
    if(Date.now()<instantUntil&&typeof x==='number'&&typeof y==='number'){ return nativeScrollTo.call(window,{left:x,top:y,behavior:'instant'}); }
    return nativeScrollTo.apply(window,arguments);
  };
  function instant(){ instantUntil=Date.now()+1500; }
  document.addEventListener('click',function(e){
    var el=e.target; if(!el||!el.closest){ return; }
    var a=el.closest('.jdgm-rev-widg a, .jdgm-all-reviews-widget a, .jdgm-carousel a');
    if(a){ a.setAttribute('data-elementor-open-lightbox','no'); instant(); }
    if(el.closest('.jm-mfp-wrap, .jm-mfp-bg')){ instant(); }
  },true);
  document.addEventListener('keydown',function(e){ if((e.key==='Escape'||e.keyCode===27)&&document.querySelector('.jm-mfp-wrap')){ instant(); } },true);
  function relayout(){
    var $=window.jdgm&&window.jdgm.$;
    if(!$||!$.fn||!$.fn.masonry){ return; }
    document.querySelectorAll('.jdgm-rev-widg__reviews, .jdgm-all-reviews__body').forEach(function(list){
      if(!list.isConnected||!list.offsetParent){ return; }
      var $list=$(list);
      if($list.data('masonry')){ $list.masonry('layout'); }
    });
  }
  function burst(){ [400,1200,2500,5000].forEach(function(t){ setTimeout(relayout,t); }); }
  function unstick(){
    document.querySelectorAll('.jdgm-rev-widg__paginate-spinner-wrapper, .jdgm-all-reviews-widget > .jdgm-spinner').forEach(function(sp){ sp.style.display='none'; });
    document.querySelectorAll('.jdgm-rev-widg__body').forEach(function(b){ if(getComputedStyle(b).display==='none'){ b.style.display=''; } });
    burst();
  }
  function hook($){
    $(document).on('jdgm.doneCustomizeReviews jdgm.doneSetupVideos',burst);
    document.addEventListener('jdgm.doneSetupGrid',burst);
    $(document).on('ajaxError',function(e,xhr,settings){
      if(!settings||!/reviews_for_widget|all_reviews_js_based/.test(settings.url||'')){ return; }
      if(settings.zjRetried){ unstick(); return; }
      /* Judge.me's CDN refuses quick repeats now and then: retry after a short pause */
      setTimeout(function(){
        $.ajax({
          url:settings.url+(settings.url.indexOf('?')<0?'?':'&')+'zjr='+Date.now(),
          dataType:settings.dataType,
          zjRetried:true,
          success:settings.success,
          error:function(){ unstick(); }
        });
      },900);
    });
  }
  window.addEventListener('load',burst);
  var tries=0, wait=setInterval(function(){
    var $=window.jdgm&&window.jdgm.$;
    if($){ clearInterval(wait); hook($); }
    else if(++tries>80){ clearInterval(wait); }
  },250);
})();
/* Review lists (v20): Judge.me's default order ("Pictures first"), a short
   preview with a CSS-mask fade and a "Load More Reviews" button.
   - Preview: 3 rows on desktop (product widget: 2 on tablet and phone; all-reviews: 3), one more
     row when that is shorter than --zj-min (up to 2 more), so it always looks
     full. The cut line follows the SHORTEST column, so no column shows empty
     space; longer columns fade out mid-card.
   - 1 and 2 star reviews move to the end of what is loaded, so the preview
     opens on the good ones; they still show further down after Load More, at
     the very end, and when a visitor filters by stars or picks another sort.
     If the first batch has too few good ones, the next batch loads before the
     preview shows (up to 3 times).
   - Each list stays hidden, its room kept, until the preview is ready (5 s
     limit, or right after a batch fails to load), so nothing jumps.
   - A click shows more loaded rows while every column still has cards below
     the line, otherwise it fetches the next batch; with nothing left, the cut
     and the fade go. Judge.me's jump back to the top of the reviews is off. */
(function(){
  var cfg={
    all:{ step:3, bodies:'.jdgm-all-reviews__body, .jdgm-shop-reviews__body' },
    product:{ get step(){ return window.innerWidth>=1025?3:2; }, bodies:'.jdgm-rev-widg__reviews' }   /* desktop: at least 3 rows (Henson) */
  };
  function visible(el){ return !!(el && el.offsetParent); }
  function kind(w){ return w.classList.contains('jdgm-all-reviews-widget')?'all':'product'; }
  function nextPage(w){ return w.querySelector('.jdgm-rev-widg__body .jdgm-paginate__next-page'); }
  function loading(w){ return Date.now()<(w.zjLoadingUntil||0)&&w.querySelectorAll('.jdgm-rev').length===w.zjCount; }
  function serverMore(w){
    return (kind(w)==='all'?visible(w.querySelector('.jdgm-all-reviews-page__load-more-wrapper')):!!nextPage(w))||loading(w);
  }
  function ensureButton(w){
    if(kind(w)!=='product'){ return null; }
    var body=w.querySelector('.jdgm-rev-widg__body'); if(!body){ return null; }
    var wrap=w.querySelector('.zj-load-more-wrap');
    if(!wrap){
      wrap=document.createElement('div'); wrap.className='zj-load-more-wrap';
      wrap.innerHTML='<a href="#" class="jdgm-btn zj-load-more" role="button">Load More Reviews</a>';
      body.parentNode.insertBefore(wrap, body.nextSibling);
      w.classList.add('zj-load-more-on');
    }
    return wrap;
  }
  /* 1-2 star reviews go last, only in the default order */
  function stars(card){ var r=card.querySelector('.jdgm-rev__rating'); return r?+r.getAttribute('data-score'):5; }
  function curated(w){
    var sel=w.querySelector('.jdgm-rev-widg__sort-wrapper .jdgm-sort-dropdown');
    return !sel||!sel.value||sel.value==='pictures-first';
  }
  function curate(w,b){
    if(!curated(w)){ return; }
    var cards=[].slice.call(b.querySelectorAll(':scope > .jdgm-rev')), seenLow=false, moved=false;
    if(!cards.some(function(c){ return stars(c)>2; })){ return; }
    cards.forEach(function(c){ if(stars(c)<=2){ seenLow=true; } else if(seenLow){ moved=true; } });
    if(!moved){ return; }
    cards.filter(function(c){ return stars(c)<=2; }).forEach(function(c){ b.appendChild(c); });
    var $=window.jdgm&&jdgm.$;
    if($&&$.fn&&$.fn.masonry&&$(b).data('masonry')){ $(b).masonry('reloadItems').masonry('layout'); }
  }
  function minHeight(b){ return parseFloat(getComputedStyle(b).getPropertyValue('--zj-min'))||0; }
  function ready(w){
    if(w.classList.contains('zj-sorted')){ return; }
    w.classList.add('zj-sorted');
    [80,400].forEach(function(t){ setTimeout(clipAll,t); });
  }
  /* Judge.me redraws the list while setting up: wait until its sort menu and paging listen */
  function jdgmReady(w){
    var $=window.jdgm&&jdgm.$; if(!$||!$._data){ return false; }
    function on(el,type){ var ev=el&&$._data(el,'events'); return !!(ev&&ev[type]); }
    if(!on(w.querySelector('.jdgm-rev-widg__sort-wrapper .jdgm-sort-dropdown'),'change')){ return false; }
    return kind(w)==='all'||on(w.querySelector('.jdgm-rev-widg__body'),'click');
  }
  function fetchNext(w){
    w.zjCount=w.querySelectorAll('.jdgm-rev').length;
    w.zjLoadingUntil=Date.now()+3500;   /* a batch that has not arrived by then counts as failed */
    if(kind(w)==='all'){
      var btn=w.querySelector('.jdgm-all-reviews-page__load-more'); if(!btn){ return; }
      w.zjAuto=true; btn.click(); w.zjAuto=false;
    }else{
      var nx=nextPage(w); if(!nx){ return; }
      if(window.jdgmSettings){ jdgmSettings.widget_pagination_type='load_more'; }
      nx.click();
    }
  }
  /* Landing page only (Elementor column containers measured the photo strip too short); no match here */
  function fixBox(w){
    if(w.zjBox){ return; } w.zjBox=true;
    var el=w.closest('.elementor-widget-html'), p=el&&el.parentNode; if(!p){ return; }
    var cs=getComputedStyle(p);
    if(cs.display.indexOf('flex')>-1&&cs.flexDirection.indexOf('column')===0&&cs.flexWrap==='wrap'){ p.style.flexWrap='nowrap'; }
  }
  function clip(w){
    fixBox(w);
    var c=cfg[kind(w)], wrap=ensureButton(w), more=serverMore(w), showBtn=false, short=false, any=false;
    if(!w.zjSeen){ w.zjSeen=Date.now(); }
    busy(w, w.classList.contains('zj-sorted')&&loading(w));
    w.querySelectorAll(c.bodies).forEach(function(b){
      if(!visible(b)){ return; }
      curate(w,b);
      var set=b.getAttribute('data-zj-rows'), rows=+(set||c.step);
      var top=b.getBoundingClientRect().top, cols={}, good={}, all=[], useAll=!curated(w), lefts=[];
      /* one key per column (sub-pixel positions differ by a pixel or two) */
      function col(left){ for(var i=0;i<lefts.length;i++){ if(Math.abs(lefts[i]-left)<6){ return 'c'+i; } } lefts.push(left); return 'c'+(lefts.length-1); }
      b.querySelectorAll(':scope > .jdgm-rev').forEach(function(card){
        var r=card.getBoundingClientRect(); if(!r.height){ return; }
        var x=col(r.left); (cols[x]=cols[x]||[]).push(r); all.push(r);
        if(stars(card)>2){ (good[x]=good[x]||[]).push(r); }
      });
      var keys=Object.keys(cols); if(!keys.length){ return; }
      any=true;
      if(!Object.keys(good).length){ useAll=true; }
      var pick=useAll?cols:good;
      keys.forEach(function(x){ (pick[x]=pick[x]||[]).sort(function(a,d){ return a.top-d.top; }); });
      /* the cut: every column shows at least `rows` cards (the second-deepest column decides, so one
         column of very tall cards can't stretch the preview), but never past the end of any column's
         good reviews, so no column shows a gap or a 1-2 star card */
      function need(n){
        var d=[]; keys.forEach(function(x){ var l=pick[x]; if(l.length){ d.push(l[Math.min(n,l.length)-1].bottom-top); } });
        d.sort(function(p,q){ return p-q; });
        return d.length?d[Math.max(0,d.length-(d.length>=3?2:1))]:0;
      }
      var cap=Infinity;
      keys.forEach(function(x){ var l=pick[x]; cap=Math.min(cap,l.length?l[l.length-1].bottom-top:0); });
      if(cap<=0&&!more){ pick=cols; useAll=true; cap=Infinity; keys.forEach(function(x){ pick[x].sort(function(a,d){ return a.top-d.top; }); cap=Math.min(cap,pick[x][pick[x].length-1].bottom-top); }); }
      function cut(n){ return Math.min(need(n),cap); }
      var min=set?0:minHeight(b);
      if(!set){ while(rows<c.step+2&&cut(rows)<min&&need(rows+1)<=cap){ rows++; } }
      var h=cut(rows);
      var hidden=all.some(function(r){ return r.bottom-top>h+1; });
      /* not enough good reviews loaded for the rows (or the minimum height): another batch is needed */
      if(more&&(need(rows)>cap||(h<min&&rows<c.step+2))){ short=true; }
      var showAll=b.getAttribute('data-zj-all')==='1'&&!more;
      b.zjCanGrow=hidden&&cap>h+1;
      if(!showAll&&(hidden||more)){ b.style.maxHeight=Math.ceil(h)+'px'; b.classList.add('zj-clipped'); showBtn=true; }
      else{ b.style.maxHeight=''; b.classList.remove('zj-clipped'); }
    });
    if(wrap){ wrap.style.display=showBtn?'':'none'; }
    /* first view: load another batch when too few good reviews fill the preview, then show it */
    if(!w.classList.contains('zj-sorted')&&any){
      w.zjAutoLoads=w.zjAutoLoads||0;
      var failed=w.zjAutoLoads>0&&!loading(w)&&w.querySelectorAll('.jdgm-rev').length===w.zjCount;
      if(short&&!failed&&w.zjAutoLoads<3&&Date.now()-w.zjSeen<5000){ if(!loading(w)&&jdgmReady(w)&&Date.now()-(w.zjLastAuto||0)>1200){ w.zjAutoLoads++; w.zjLastAuto=Date.now(); fetchNext(w); } }
      else if(!loading(w)||Date.now()-w.zjSeen>=5000){ ready(w); }
    }
  }
  /* loading shows inside the button (spinner + dimmed), not as Judge.me's ring under it */
  function busy(w,on){
    w.classList.toggle('zj-fetching',on);
    w.querySelectorAll('.zj-load-more, .jdgm-all-reviews-page__load-more').forEach(function(btn){ btn.classList.toggle('zj-busy',on); });
  }
  function widgets(){ return document.querySelectorAll('.jdgm-all-reviews-widget, .jdgm-review-widget'); }
  function clipAll(){ stayPut(); [].forEach.call(widgets(),clip); }
  function soon(){ [50,400,1200,2500,5000,7500,10500].forEach(function(t){ setTimeout(clipAll,t); }); }
  window.zjClipAll=clipAll;
  /* one click: more loaded rows, or the next batch, or (at the very end) everything */
  function grow(w,e,fetchMore){
    var c=cfg[kind(w)];
    var b=[].slice.call(w.querySelectorAll(c.bodies)).filter(visible)[0];
    if(!b){ return; }
    var shown=b.style.maxHeight?Math.round(parseFloat(b.style.maxHeight)):0;
    var rows=+(b.getAttribute('data-zj-rows')||c.step);
    if(!b.getAttribute('data-zj-rows')){ while(rows<c.step+2){ b.setAttribute('data-zj-rows',rows); clip(w); if(Math.round(parseFloat(b.style.maxHeight)||0)>=shown){ break; } rows++; } }
    b.setAttribute('data-zj-rows',rows+c.step);
    if(b.zjCanGrow){
      if(e){ e.preventDefault(); e.stopImmediatePropagation(); }
    }else if(serverMore(w)){
      w.zjCount=w.querySelectorAll('.jdgm-rev').length;
      w.zjLoadingUntil=Date.now()+10000;
      busy(w,true);
      if(fetchMore){ fetchMore(); }
    }else{
      b.setAttribute('data-zj-all','1');
      if(e){ e.preventDefault(); e.stopImmediatePropagation(); }
    }
    soon();
  }
  document.addEventListener('click',function(e){
    var el=e.target; if(!el||!el.closest){ return; }
    stayPut();
    var allBtn=el.closest('.jdgm-all-reviews-page__load-more');
    if(allBtn){ var aw=allBtn.closest('.jdgm-all-reviews-widget'); if(aw&&!aw.zjAuto){ grow(aw,e); } return; }
    var ours=el.closest('.zj-load-more');
    if(ours){
      e.preventDefault();
      var w=ours.closest('.jdgm-review-widget');
      grow(w,null,function(){
        var nx=nextPage(w); if(!nx){ return; }
        if(window.jdgmSettings){ jdgmSettings.widget_pagination_type='load_more'; }
        nx.click();
      });
      return;
    }
    if(el.closest('.jdgm-subtab__name, .jdgm-sort-dropdown, .jdgm-histogram__row')){ soon(); }
  },true);
  document.addEventListener('change',function(e){
    var s=e.target;
    if(s&&s.classList&&s.classList.contains('jdgm-sort-dropdown')){
      var w=s.closest('.jdgm-all-reviews-widget, .jdgm-review-widget');
      if(w){ w.querySelectorAll('[data-zj-rows]').forEach(function(b){ b.removeAttribute('data-zj-rows'); b.removeAttribute('data-zj-all'); }); }
      soon();
    }
  },true);
  /* keep the page where the visitor is: no jump to the top of the reviews */
  function noScroll(){ return false; }
  function focusNoScroll(r){
    var t=r&&r.find?r.find('.jdgm-rev, .jdgm-quest').first():null;
    if(t&&t.length){ t.attr('tabindex','-1'); try{ t[0].focus({preventScroll:true}); }catch(err){} }
  }
  function stayPut(){
    if(window.jdgmSettings&&jdgmSettings.scrollTo!==noScroll){ jdgmSettings.scrollTo=noScroll; }
    if(window.jdgm&&jdgm._focusFirstPaginatedItem&&jdgm._focusFirstPaginatedItem!==focusNoScroll){ jdgm._focusFirstPaginatedItem=focusNoScroll; }
  }
  var rt; window.addEventListener('resize',function(){ clearTimeout(rt); rt=setTimeout(clipAll,200); });
  window.addEventListener('load',soon);
  /* quick checks while Judge.me draws the first reviews, then slower ones */
  var n=0, iv=setInterval(function(){ clipAll(); if(++n>40){ clearInterval(iv); var m=0, iv2=setInterval(function(){ clipAll(); if(++m>30){ clearInterval(iv2); } },500); } },150);
  var bound=false, wt=0, wb=setInterval(function(){
    if(++wt>100){ clearInterval(wb); }
    if(window.jdgm&&jdgm.$){ clearInterval(wb); if(!bound){ bound=true; jdgm.$(document).on('jdgm.doneCustomizeReviews jdgm.doneSetupVideos',function(){ setTimeout(clipAll,0); }); } }
  },100);
})();

/* Zenith store addition (not on the landing page): Judge.me places the cards once, with the heights they have at that
   moment. On the store the card CSS loads after the reviews draw and "Read more" / late photos change heights, which
   left empty holes and overlapping cards. A ResizeObserver re-runs Judge.me's own layout whenever any card changes
   size (batched to one layout per frame). */
(function(){
  if(!('ResizeObserver' in window)){ return; }
  var queued=new Set(), frame=0;
  /* Judge.me's Masonry slides cards into place with a CSS transition and only writes the final top/left when that
     transition ends. The card CSS turns transitions off, so the end never came: cards kept a half-way transform and
     overlapped. Masonry moves them instantly instead (transitionDuration 0) and any stuck transform is cleared. */
  function fix(list){
    var $=window.jdgm&&window.jdgm.$;
    if(!$||!$.fn||!$.fn.masonry||!list.isConnected||!$(list).data('masonry')){ return; }
    var m=$(list).data('masonry');
    if(m.options&&m.options.transitionDuration!==0){ $(list).masonry('option',{ transitionDuration:0 }); }
    for(var i=0;i<list.children.length;i++){ if(list.children[i].style.transform){ list.children[i].style.transform=''; } }
    if(list.offsetParent){ $(list).masonry('layout'); }
  }
  function flush(){
    frame=0;
    queued.forEach(fix);
    queued.clear();
  }
  var ro=new ResizeObserver(function(entries){
    entries.forEach(function(en){ var list=en.target.parentElement; if(list){ queued.add(list); } });
    if(!frame){ frame=requestAnimationFrame(flush); }
  });
  var seen=new WeakSet();
  function watch(){
    document.querySelectorAll('.jdgm-rev-widg__reviews > .jdgm-rev, .jdgm-all-reviews__body > .jdgm-rev').forEach(function(card){
      if(!seen.has(card)){ seen.add(card); ro.observe(card); }
    });
  }
  function all(){ watch(); document.querySelectorAll('.jdgm-rev-widg__reviews, .jdgm-all-reviews__body').forEach(fix); }
  var n=0, iv=setInterval(function(){ all(); if(++n>60){ clearInterval(iv); } },500);
  window.addEventListener('load',function(){ setTimeout(all,300); });
  document.addEventListener('click',function(){ [800,1800,4000].forEach(function(t){ setTimeout(all,t); }); },true);
})();
