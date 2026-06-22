(function(){
  function run(fn){ if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fn);}else{fn();}}
  var genres=[['ทั้งหมด',''],['กำลังมาแรง','trending-movies'],['ยอดนิยม','coming-soon-movies'],['คะแนนสูง','top-rated-movies'],['แอ็กชัน','action-movies'],['ผจญภัย','adventure-movies'],['แอนิเมชัน','animation-movies'],['ตลก','comedy-movies'],['สยองขวัญ','horror-movies'],['โรแมนติก','romance-movies'],['ระทึกขวัญ','thriller-movies'],['ไซไฟ','scifi-movies'],['แฟนตาซี','fantasy-movies'],['ประวัติศาสตร์','history-movies'],['สงคราม','war-movies']];
  function openSearch(q){var b=document.getElementById('search-btn'); if(b)b.dispatchEvent(new MouseEvent('click',{bubbles:true})); setTimeout(function(){var i=document.getElementById('search-input'); if(i){i.value=q||''; i.dispatchEvent(new Event('input',{bubbles:true})); i.focus();}},100);}
  run(function(){
    var hero=document.getElementById('hero-section'); if(!hero||document.getElementById('compact-discovery-rail'))return;
    var rail=document.createElement('section'); rail.id='compact-discovery-rail'; rail.className='compact-discovery-rail rail-active';
    rail.innerHTML='<div class="compact-discovery-shell"><form id="compact-search-form" class="compact-search-box"><span>⌕</span><input id="compact-search-input" type="search" placeholder="ค้นหา"></form><div class="compact-genre-mask"><div id="compact-genre-track" class="compact-genre-track"></div></div></div>';
    hero.insertAdjacentElement('afterend',rail);
    var track=rail.querySelector('#compact-genre-track');
    function addSet(){genres.forEach(function(g){var btn=document.createElement('button');btn.type='button';btn.className='compact-genre-chip';btn.textContent=g[0];btn.addEventListener('click',function(){ if(g[1]){var r=document.getElementById(g[1]); if(r)r.scrollIntoView({behavior:'smooth',block:'start'}); }else{openSearch('');}});track.appendChild(btn);});}
    addSet();addSet();
    rail.querySelector('#compact-search-form').addEventListener('submit',function(e){e.preventDefault();openSearch(rail.querySelector('#compact-search-input').value.trim());});
    var t; window.addEventListener('scroll',function(){rail.classList.remove('rail-active');clearTimeout(t);t=setTimeout(function(){rail.classList.add('rail-active');},550);},{passive:true});
    var p=document.getElementById('header-premium-btn'); if(p){p.classList.add('dofree-premium-pill');p.innerHTML='<span>◆</span><span>สมาชิก</span>';}
    var l=document.getElementById('login-btn'); if(l){l.classList.add('dofree-login-pill');}
  });
})();
