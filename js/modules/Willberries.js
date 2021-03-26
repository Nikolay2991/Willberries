// cart 

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link');
const longGoodsList = document.querySelector('.long-goods-list');
const showClothing = document.querySelectorAll('.show-clothing');
const showAcsessories = document.querySelectorAll('.show-acsessories');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');

const getGoods = async () => {
	const result = await fetch('db/db.json');
	if(!result.ok) {
		throw 'Ошибочка вышла: ' + result.status
	}
	return result.json();
};

const cart = {
	cartGoods: [],
    countQuantity() {
        console.log(this.cartGoods)
        cartCount.textContent = this.cartGoods.reduce((sum, item) => {
            return sum + item.count
        },0)
    },
	renderCart(){
		cartTableGoods.textContent ='';
		this.cartGoods.forEach(({id, name, price, count}) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus" data-id="${id}">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus" data-id="${id}">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete" data-id="${id}">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + item.price * item.count;
		}, 0);

		cardTableTotal.textContent = totalPrice + '$'

	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCart();
        this.countQuantity();
	},
	minusGood(id){
		for (const item of this.cartGoods) {
			if (item.id === id) {
				if (item.count <= 1) {
					this.deleteGood(id)
				} else {
					item.count--;
				}
				break;
			}
		}
		this.renderCart();
        this.countQuantity();
	},
	plusGood(id){
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count++;
				break;
			}
		}
		this.renderCart();
        this.countQuantity();
	},
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if (goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({id, name, price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1,
					});
                    cart.countQuantity();
				});
		}
	},
}


document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart');
	if (addToCart) {
		cart.addCartGoods(addToCart.dataset.id)
	}
})

cartTableGoods.addEventListener('click', event => {
	const target = event.target;
	if (target.tagName === "BUTTON") {
		const id = target.closest('.cart-item').dataset.id;

		if (target.classList.contains('cart-btn-delete')) {
			cart.deleteGood(id);
		};
		if (target.classList.contains('cart-btn-minus')) {
			cart.minusGood(id);
		};
		if (target.classList.contains('cart-btn-plus')) {
			cart.plusGood(id);
		};
	}
	
})

const openModal = () => {
	modalCart.classList.add('show');
	cart.renderCart();
};

const closeModal = () => {
	modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);

// Закрытие модального окна при нажатии на оверлей и на крестик

modalCart.addEventListener('click', function(event) {
	const target = event.target;
	// Если клик мышки на overlay или modal-close (крестик) то закрываем модалку closeModal()
	if (target.classList.contains('overlay') || target.classList.contains('modal-close')) {
		closeModal();
	};

});

// goods

const createCard = function({label, name, img, description, id, price}) {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `
		<div class="goods-card">
			${label ? 
				`<span class="label">${label}</span>` :
				''
			}
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>
	`;

	return card;
};

const renderCards = data => {
	longGoodsList.textContent = '';
	const cards = data.map(createCard)
	longGoodsList.append(...cards)
	document.body.classList.add('show-goods')
};

const showAll = event => {
	event.preventDefault();
	getGoods().then(renderCards);
}

viewAll.forEach(elem => {
	elem.addEventListener('click', showAll);
});


const filterCards = function(field, value) {
	getGoods()
		.then(data =>  data.filter(good => good[field] === value))
		.then(renderCards);
};

navigationLink.forEach(function (link) {
	link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		if (!field) return;
		filterCards(field, value);
	});
});

showClothing.forEach(item => {
	item.addEventListener('click', event => {
		event.preventDefault();
		filterCards('category', 'Accessories')
	});
});

showAcsessories.forEach(item => {
	item.addEventListener('click', event => {
		event.preventDefault();
		filterCards('category', 'Clothing');
	});
});