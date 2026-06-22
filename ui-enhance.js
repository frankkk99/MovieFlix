(function(){
  function transformTitle(item){
    if(!item || typeof item !== 'object') return item;
    var thai = item.title || item.name || '';
    var english = item.original_title || item.original_name || thai;
    if(english && english !== thai){
      item.thai_title = thai;
      if(item.title) item.title = english;
      if(item.name) item.name = english;
      var note = 'ชื่อไทย: ' + thai;
      if(item.overview && item.overview.indexOf(note) === -1){ item.overview = note + '\n\n' + item.overview; }
      if(!item.overview){ item.overview = note; }
    }
    return item;
  }
  function transformPayload(data){
    if(!data || typeof data !== 'object') return data;
    if(Array.isArray(data.results)) data.results.forEach(transformTitle);
    if(Array.isArray(data.cast)) data.cast.forEach(transformTitle);
    transformTitle(data);
    return data;
  }
  var originalFetch = window.fetch;
  if(originalFetch && !window.__dofreeFetchEnhanced){
    window.__dofreeFetchEnhanced = true;
    window.fetch = function(){
      var args = arguments;
      return originalFetch.apply(this,args).then(function(response){
        var url = String(args[0] || '');
        if(url.indexOf('api.themoviedb.org') === -1) return response;
        var clone = response.clone();
        response.json = function(){ return clone.json().then(transformPayload); };
        return response;
      });
    };
  }

  function run(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);}else{fn();}}
  var genres=[['ทั้งหมด',''],['กำลังมาแรง','trending-movies'],['ยอดนิยม','coming-soon-movies'],['คะแนนสูง','top-rated-movies'],['แอ็กชัน','action-movies'],['ผจญภัย','adventure-movies'],['แอนิเมชัน','animation-movies'],['ตลก','comedy-movies'],['อาชญากรรม',''],['สารคดี',''],['ดราม่า',''],['ครอบครัว',''],['แฟนตาซี','fantasy-movies'],['ประวัติศาสตร์','history-movies'],['สยองขวัญ','horror-movies'],['เพลง',''],['ลึกลับ',''],['โรแมนติก','romance-movies'],['ไซไฟ','scifi-movies'],['ทีวีมูฟวี่',''],['ระทึกขวัญ','thriller-movies'],['สงคราม','war-movies'],['คาวบอย','']];
  function openSearch(q){var b=document.getElementById('search-btn'); if(b)b.dispatchEvent(new MouseEvent('click',{bubbles:true})); setTimeout(function(){var i=document.getElementById('search-input'); if(i){i.value=q||''; i.dispatchEvent(new Event('input',{bubbles:true})); i.focus();}},100);}
  run(function(){
    var hero=document.getElementById('hero-section'); if(!hero||document.getElementById('compact-discovery-rail'))return;
    var rail=document.createElement('section'); rail.id='compact-discovery-rail'; rail.className='compact-discovery-rail rail-active';
    rail.innerHTML='<div class="compact-discovery-shell"><form id="compact-search-form" class="compact-search-box"><span>⌕</span><input id="compact-search-input" type="search" placeholder="ค้นหา"></form><div class="compact-genre-mask"><div id="compact-genre-track" class="compact-genre-track"></div></div></div>';
    hero.insertAdjacentElement('afterend',rail);
    var track=rail.querySelector('#compact-genre-track');
    function addSet(){genres.forEach(function(g){var btn=document.createElement('button');btn.type='button';btn.className='compact-genre-chip';btn.textContent=g[0];btn.addEventListener('click',function(){ if(g[1]){var r=document.getElementById(g[1]); if(r)r.scrollIntoView({behavior:'smooth',block:'start'}); }else{openSearch(g[0]==='ทั้งหมด'?'':g[0]);}});track.appendChild(btn);});}
    addSet();addSet();
    rail.querySelector('#compact-search-form').addEventListener('submit',function(e){e.preventDefault();openSearch(rail.querySelector('#compact-search-input').value.trim());});
    var t; window.addEventListener('scroll',function(){rail.classList.remove('rail-active');clearTimeout(t);t=setTimeout(function(){rail.classList.add('rail-active');},550);},{passive:true});
    ['pointerdown','mouseenter','focusin'].forEach(function(ev){rail.addEventListener(ev,function(){rail.classList.add('rail-active');});});
    var p=document.getElementById('header-premium-btn'); if(p){p.classList.add('dofree-premium-pill');p.innerHTML='<span>◆</span><span>สมาชิก</span>';}
    var l=document.getElementById('login-btn'); if(l){l.classList.add('dofree-login-pill');}
  });
})();
