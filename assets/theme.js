/* appliqué avant l'affichage pour éviter un flash de thème */
(function(){try{var d=JSON.parse(localStorage.getItem('majalis-ramadan-v1')||'{}');var t=d.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;if(d.fs)document.documentElement.style.setProperty('--fs',d.fs+'px');}catch(e){}})();
