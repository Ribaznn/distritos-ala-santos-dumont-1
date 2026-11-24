// =====================================================================
//  ORGANIZAÇÃO DOS GRUPOS POR DISTRITO
//  Edite aqui nomes, cores e bairros. As páginas (mapa e PDF) leem
//  este arquivo. Bairros de Aracaju usam os nomes oficiais do
//  OpenStreetMap; na Barra a divisão é feita pela linha do Posto Petrox.
// =====================================================================
window.UNIDADE = {
  titulo: 'Organização dos Grupos por Distrito',
  ala: 'Ala Santos Dumont 1',
  estaca: 'Estaca Aracaju Norte'
};

window.DISTRITOS = [
  {
    id: 1, codigo: '01', nome: 'Centro Barra', cor: '#E4572E',
    descricao: 'Barra dos Coqueiros a oeste da Rod. José de Campos (SE-100): centro, Serigy, Alphaville até Atalaia Nova',
    lider: 'Moacir', assistentes: ['Daniel', 'Jeancarla'],
    regra: { tipo: 'barra', lado: 'sul' }
  },
  {
    id: 2, codigo: '02', nome: "Olhos d'Água", cor: '#E8A317',
    descricao: 'Do Posto Petrox sentido Pirambu e a leste da Rod. José de Campos (SE-100) até a praia (Espaço Tropical, Brisas, Luar e Quintas da Barra), até o limite norte da ala',
    lider: 'David Ivan', assistentes: ['Douglas Dantas', 'Elaine Alfano'],
    regra: { tipo: 'barra', lado: 'norte' }
  },
  {
    id: 3, codigo: '03', nome: 'Centro Aracaju', cor: '#7B3FA0',
    descricao: 'Centro de Aracaju e trechos de Getúlio Vargas e Cirurgia dentro do limite',
    lider: 'Alex', assistentes: ['Marcos', 'Cristiane'],
    regra: { tipo: 'bairros', bairros: ['Centro', 'Getúlio Vargas', 'Cirurgia'],
             rotulos: { 'Centro': 'Centro (Aracaju)' } }
  },
  {
    id: 4, codigo: '04', nome: 'Industrial', cor: '#12907E',
    descricao: 'Industrial e Santo Antônio',
    lider: 'Hadley', assistentes: ['Marcelo', 'Cleideane'],
    regra: { tipo: 'bairros', bairros: ['Industrial', 'Santo Antônio'] }
  },
  {
    id: 5, codigo: '05', nome: '18 do Forte', cor: '#D6336C',
    descricao: 'Palestina e a parte do 18 do Forte dentro do limite azul, com a faixa entre a Av. Maranhão e a Av. São Paulo',
    lider: 'Alex Firmino', assistentes: ['Jeferson', 'Andressa'],
    regra: { tipo: 'bairros', bairros: ['18 do Forte', 'Palestina', 'Santos Dumont'] }
  },
  {
    id: 6, codigo: '06', nome: 'Japãozinho', cor: '#3E9B3A',
    descricao: 'Japãozinho e a área do Coqueiral junto ao Rio do Sal (divisa com a Cidade Nova)',
    lider: 'Jeremias', assistentes: ['Alex Galetinho', 'Everalda'],
    regra: { tipo: 'bairros', bairros: ['Japãozinho', 'Lamarão', 'Cidade Nova'],
             rotulos: { 'Lamarão': 'Coqueiral (junto ao Rio do Sal)' } }
  },
  {
    id: 7, codigo: '07', nome: 'Porto Dantas', cor: '#3949AB',
    descricao: 'Porto Dantas',
    lider: 'Renato Paulo', assistentes: ['Idalécio', 'Ana Zélia'],
    regra: { tipo: 'bairros', bairros: ['Porto Dantas'] }
  }
];
