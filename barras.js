class BarrasJs {
    constructor({ width = 800, height = 600, margin = { top: 20, right: 30, bottom: 100, left: 50 } } = {}) {
        this.w = width;
        this.h = height;
        this.margin = margin;
        this.svg = null;
        this.data = [];
    }

    createSvg(selector) {
        this.svg = d3.select(selector)
            .append("svg")
            .attr("width", this.w)
            .attr("height", this.h);
    }

    async loadJson(file) {
        // Carregar o JSON e mapear os dados
        const rawData = await d3.json(file);
        this.data = rawData.map(d => ({
            product: d["Product Name"],
            quantity: +d.Quantity || 0
        }));

        // Filtrar produtos sem quantidade e pegar os 10 produtos com maiores quantidades, com valores distintos
        const uniqueQuantities = new Set();
        this.data = this.data
            .filter(d => d.quantity > 0)
            .sort((a, b) => b.quantity - a.quantity)
            .filter(d => {
                if (!uniqueQuantities.has(d.quantity)) {
                    uniqueQuantities.add(d.quantity);
                    return true;
                }
                return false;
            })
            .slice(0, 10);
    }

    drawChart() {
        const width = this.w - this.margin.left - this.margin.right;
        const height = this.h - this.margin.top - this.margin.bottom;

        const xScale = d3.scaleBand()
            .domain(this.data.map(d => d.product))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, d => d.quantity)])
            .nice()
            .range([height, 0]);

        // Adicionar grupo de barras
        const g = this.svg.append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Adicionar barras
        g.selectAll("rect")
            .data(this.data)
            .join("rect")
            .attr("x", d => xScale(d.product))
            .attr("y", d => yScale(d.quantity))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.quantity))
            .style("fill", "RoyalBlue");

        // Adicionar eixos
        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        g.append("g")
            .call(d3.axisLeft(yScale));
    }

    updateData(newData) {
        this.data = newData;
        this.svg.selectAll("*").remove();  // Limpar SVG para atualização
        this.drawChart();
    }

    async run(selector, file) {
        this.createSvg(selector);
        await this.loadJson(file);
        this.drawChart();
    }
}

window.onload = async () => {
    const app1 = new BarrasJs({ width: 700, height: 500 });
    await app1.run("#main", "superstore.json");

    // Para criar outra instância em outro elemento com dados dinâmicos:
    const app2 = new BarrasJs({ width: 500, height: 400, margin: { top: 20, right: 20, bottom: 80, left: 40 } });
    await app2.run("#secondary", "outroArquivo.json");

    // Para atualizar dados dinamicamente:
    setTimeout(() => {
        app1.updateData([{ product: "Product A", quantity: 100 }, { product: "Product B", quantity: 200 }]);
    }, 3000);
};
