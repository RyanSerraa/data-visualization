class GraficoDispersao {
  constructor(config) {
    this.config = config;

    this.svg = null;
    this.margens = null;

    this.intervaloX = null;
    this.intervaloY = null;

    this.circulos = []

    this.createSvg();
    this.createMargins();
  }

  createSvg() {
    this.svg = d3.select(this.config.div)
      .append("svg")
      .attr("viewBox", [0, 0, this.config.width + this.config.left + this.config.right , this.config.height + this.config.top + this.config.bottom])
      .style("max-width", `${this.config.width}px`)
      // .style("border", "1px solid black");
      const legenda = document.querySelector(".legenda");
      legenda.style.marginTop = `${this.config.height - this.config.bottom - this.config.top- this.config.left - this.config.right}px`;
  }

  createMargins() {
    this.margens = this.svg
      .append('g')
  }
  async loadJSON(file) {
    this.circulos = await d3.json(file);

    this.circulos = this.circulos.map(d => {
        return {
            cx: +d.Profit,
            cy: +d.Sales,
            col: d.Discount,
            cat: d.Category,
            r: 4
        };
    });

    const randomStart = Math.floor(Math.random() * Math.max(0, this.circulos.length - 1000));
    this.circulos = this.circulos.slice(randomStart, randomStart + 1000);
}


  createScales() {
    let xExtent = d3.extent(this.circulos, d => {
      return d.cx;
    });
    let yExtent = d3.extent(this.circulos, d => {
      return d.cy;
    });
    let colExtent = d3.extent(this.circulos, d => {
      return d.col;
    });

    const cats = this.circulos.map(d => {
      return d.cat;
    });
    let catExtent = d3.union(cats);

    this.intervaloX = d3.scaleLinear().domain(xExtent).nice().range([this.config.left, this.config.width - this.config.right]);
    this.intervaloY = d3.scaleLinear().domain(yExtent).nice().range([this.config.height-this.config.bottom, this.config.top]);

    this.colScale = d3.scaleSequential(d3.interpolateOrRd).domain(colExtent);
    this.catScale = d3.scaleOrdinal().domain(catExtent).range(d3.schemeTableau10);
  }

  createAxis() {
    let xAxis = d3.axisBottom(this.intervaloX.copy().interpolate(d3.interpolateRound))

    let yAxis = d3.axisLeft(this.intervaloY.copy().interpolate(d3.interpolateRound))

    this.margens
      .append("g")
      .attr("transform", `translate(10,${this.config.height-8})`)
      .call(xAxis)
      // .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.5)
          .attr("y1", -this.config.height + this.config.top + this.config.bottom))
      .call(g => g.append("text")
          .attr("x", this.config.width - this.config.right+15)
          .attr("y", 1)
          .attr("fill", "currentColor")
          .attr("font-weight", "bold")
          .text("Lucro"));
      

    this.margens
      .append("g")
      .attr("transform", `translate(${this.config.left+10},${this.config.top})`)
      .call(yAxis)
      // .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.5)
          .attr("x1", this.config.width - this.config.left - this.config.right))
      .call(g => g.select(".tick:last-of-type text").clone()
          .attr("x", 0)
          .attr('y', -5)
          .attr("text-anchor", "start")
          .attr("font-weight", "bold")
          .text("Valor da venda"));
  }

  renderCircles() {
    this.margens.selectAll('circle')
      .data(this.circulos)
      .join('circle')
      .attr('cx', d => this.intervaloX(d.cx))
      .attr('cy', d => this.intervaloY(d.cy))
      .attr('r' , d => d.r)
      .attr('fill', d => this.colScale(d.col))
      .attr('stroke', 'black')
  }
}


async function main() {
  let c = {div: '#main', width: 640, height: 640, top: 20, left: 40, bottom: 30, right: 40};
  
  let a = new GraficoDispersao(c);
  await a.loadJSON('./superstore.json');
  
  a.createScales();
  a.createAxis();
  a.renderCircles();
}

main();
