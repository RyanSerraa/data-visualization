class GraficoMatrizCalor {
    constructor(config) {
      if(config.width < 200) config.width = 200
      if(config.height < 150) config.height = 150
      if(config.top < 20) config.top = 20
      if(config.bottom < 20) config.bottom = 20
      if(config.left < 30) config.left = 30
      if(config.right < 30) config.width = 30
      this.config = config;
  
      this.svg = null;
      this.colors = null;
  
      this.x = null;
      this.y = null;
  
      this.data = []
  
      this.createSvg();
    }
  
    createSvg() {
      this.svg = d3.select(this.config.div)
        .append("svg")
        .attr("width", this.config.width + (2 * this.config.left) + (2 * this.config.right))
        .attr("height", this.config.height + this.config.top + this.config.bottom)
        .append("g")
          .attr("transform", `translate(${(3*this.config.left)+this.config.right},${this.config.top})`)
    }

    async loadJSON(file) {
      this.data = await d3.json(file);
    }
  
    createScales() {
      const randomNumber = Math.floor(Math.random() * 46291);
      this.data = this.data.slice(randomNumber, randomNumber+5000);
      this.data = Object.values(
        this.data.reduce((acc, item) => {
          const key = `${item.Category}-${item.Region}`;
          if (!acc[key]) {
            acc[key] = {
              category: item.Category,
              region: item.Region,
              sales: item.Sales
            };
          } else {
            acc[key].sales += item.Sales;
          }
          return acc;
        }, {})
      );

      let xExtent = this.data.map(d => {
        return d.category
      })
      let yExtent = this.data.map(d => {
        return d.region
      });
      let colExtent = d3.extent(this.data, d => {
        return d.sales;
      });
      const foundItem = this.data.find(item => item.sales === colExtent[1]);
      console.log(foundItem);
      console.log(colExtent)
  
      this.x = d3.scaleBand().domain(xExtent).range([0, this.config.width]).padding(0.01);
      this.y = d3.scaleBand().domain(yExtent).range([this.config.height, 0]).padding(0.01);
  
      this.colors = d3.scaleLinear()
    .domain([colExtent[0], (colExtent[0] + colExtent[1]) / 2, colExtent[1]])
    .range(["#ffff00", "#ff0000", "#7f00ff"]);
    }
  
    createAxis() {
      let xAxis = d3.axisBottom(this.x)
  
      let yAxis = d3.axisLeft(this.y)
  
      this.svg
        .append("g")
        .style("font-size", "12px")
        .attr("transform", "translate(0," + this.config.height + ")")
        .call(xAxis.tickSize(0))
        .select(".domain").remove();
        
  
      this.svg
        .append("g")
        .style("font-size", "12px")
        .call(yAxis.tickSize(0))
        .select(".domain").remove();
      
      var tooltip = d3.select(this.config.div)
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("position", "absolute")

      var mouseover = function(event) {
        tooltip
          .style("opacity", 1)
        d3.select(this)
          .style("stroke", "black")
          .style("opacity", 1)
      }

      var mousemove = function(event,d) {
        const formattedSales = new Intl.NumberFormat('pt-BR', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        }).format(d.sales);
        tooltip
          .html("The exact value of<br>this cell is: R$" + formattedSales)
          .style("left", (d3.pointer(event)[0]) + "px")
          .style("top", (d3.pointer(event)[1]) + "px")
      }

      var mouseleave = function(event) {
        tooltip
          .style("opacity", 0)
      }

      this.svg.selectAll()
        .data(this.data)
        .enter()
        .append('rect')
          .attr('x', d => this.x(d.category))
          .attr('y', d => this.y(d.region))
          .attr("width", this.x.bandwidth())
          .attr("height", this.y.bandwidth())
          .attr('fill', d => this.colors(d.sales))
          .attr('stroke', 'black')
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)
      
      this.svg.append("text")
      .attr("x", 0)
      .attr("y", -10)
      .attr("text-anchor", "left")
      .style("font-size", d => {
        if (this.config.width > 200 && this.config.height > 150) {
          return "22px";
        }
        return "15px";})
      .text("Passe o mouse por cima");

      
    }
  }
  
  
  async function main() {
    let c = {div: '#main', width: 500, height: 500, top: 50, left: 30, bottom: 20, right: 40};
    
    let a = new GraficoMatrizCalor(c);
    await a.loadJSON('../superstore.json');
    
    a.createScales();
    a.createAxis();
  }
  
main();
  