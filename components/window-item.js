class WindowItem extends HTMLElement {
  itemListLength;

  constructor() {
    super();
    this.itemListLength = this.getAttribute("itemListLength");
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.render();
  }
  
  render() {
    const styles = `
			`;

    this.shadowRoot.innerHTML = `
				<style>${styles}</style>
				<div>
						<slot name="header"></slot>
						<slot name="item-container"></slot>
				</div>
			`;
  }
}

export default WindowItem;
