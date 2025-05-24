const steps   = [...document.querySelectorAll('.step')];
const form    = document.getElementById('quizForm');
const progEl  = document.querySelector('#progress span');
let   curr    = 0;
const answers = [];                       // agora array de objetos

/* -------- Navegação -------- */
steps.forEach(step=>{
  step.querySelectorAll('.options button').forEach(btn=>{
    btn.addEventListener('click', e=>{
      /* marca visualmente */
      step.querySelectorAll('button').forEach(b=>b.classList.remove('selected'));
      btn.classList.add('selected');

      /* guarda {code,label} e avança */
      const idx = step.dataset.step - 1;
      answers[idx] = {
        code : btn.dataset.value,         // "A", "B" ou "C"
        label: btn.textContent.trim()     // texto visível
      };
      nextStep();
    });
  });
});

/* -------- Avança etapa -------- */
function nextStep(){
  if (curr < steps.length - 1){
    steps[curr].classList.remove('active');
    curr++;
    steps[curr].classList.add('active');
    progEl.style.width = `${curr/(steps.length-1)*100}%`;
  }
}

/* -------- Envio final -------- */
form.addEventListener('submit', async e=>{
  e.preventDefault();

  const name  = document.getElementById('name').value.trim();
  const whats = document.getElementById('whats').value.trim();
  const email = document.getElementById('email').value.trim();
  if(!name || !whats) return alert("Nome e WhatsApp são obrigatórios 😉");

  /* perfil + msg + tema idem ao anterior ------------- */
  const score = {A:0,B:0,C:0};
  answers.forEach(a=>score[a.code]++);
  let perfil,msg,theme;
  if(score.A>=2){ perfil="Rainha Visionária 👑"; msg="Inspira..."; theme="queen";}
  else if(score.B>=2){ perfil="Operária Incansável ⚙️"; msg="Executora..."; theme="worker";}
  else { perfil="Exploradora Estratégica 🔍"; msg="Analítica ..."; theme="explorer";}

  /* ------- monta payload ------- */
  const payload = {
    name,
    whatsapp : whats,
    email,
    response : {                        // será inserido na coluna json
      q1: answers[0],
      q2: answers[1],
      q3: answers[2]
    },
    perfil,
    mensagem: msg
  };

  /* POST para n8n */
  try{
    await fetch('https://n8n.grupobeely.com.br/webhook-test/8ec0fbc9-ba4f-434a-8c92-61ed971aba35',{
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify(payload)
    });
  }catch(err){
    console.error('Webhook error', err);
  }

  /* ------- mostra resultado ------- */
  const resDiv = document.getElementById('result');
  resDiv.className = `theme-${theme}`;
  resDiv.innerHTML = `
    <h2>🎉 Obrigado, ${name.split(' ')[0]}!</h2>
    <p><strong>${perfil}</strong></p>
    <p>${msg}</p>
    <p>Você receberá seu perfil no WhatsApp em breve, junto com um presente digital exclusivo da Beely.</p>
    <p>Enquanto isso, conheça mais sobre nosso ecossistema:<br>
      <a href="https://grupobeely.com.br" target="_blank">grupobeely.com.br</a> | @beely.br 🐝
    </p>`;
  resDiv.classList.remove('hidden');
  steps.forEach(s=>s.remove());
  form.remove();
});
