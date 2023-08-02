import '../css/main.less';
import React from 'react';
import ReactDOM from 'react-dom';

// Required for work on iOS 9b
import 'babel-polyfill';
import i18next from './i18n';

class PosterTaxSubtotal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            emoji: '',
            message: '',
        };
        i18next.changeLanguage(Poster.settings.lang);
        // Показываем кнопки приложения в окне настроек и заказа
        Poster.interface.showApplicationIconAt({
            payment: i18next.t('Tax subtotal'),
        });

        // Подписываемся на клик по кнопке
        Poster.on('applicationIconClicked', () => {
            const self = this;
            Poster.orders.getActive()
                .then(async (order) => {
                    const products = Object.values(order.order.products);
                    Poster.products.get(products.map(i => i.id))
                        .then((ps) => {
                            const taxes = {};
                            let total = 0;
                            for(const p in ps) {
                                const initialValue = 0;
                                const summ = products.filter(i => i.id === ps[p].id).map(i => i.count * i.price).reduce(
                                    (accumulator, currentValue) => accumulator + currentValue,
                                    initialValue
                                );
                                ps[p].summ = summ;
                                if (!Object.hasOwn(ps[p].taxId)) {
                                    taxes[ps[p].taxId] = {
                                        taxId: ps[p].taxId,
                                        title: ps[p].taxName,
                                        summ: 0
                                    }
                                }
                                taxes[ps[p].taxId].summ += summ;
                                total += summ;
                            }
                            taxes[99999] = {
                                taxId: 99999,
                                title: `<strong>${i18next.t('Total')}</strong>`,
                                summ: total
                            };
                            const msgItems = Object.values(taxes)
                                .map(i => `<li>${i.title}: <strong>${i.summ} ${Poster.settings.currencySymbol}</strong></li>`);
                            self.setState({
                                emoji: '💵',
                                message: `<ul>${msgItems.join('')}</ul>` });
                        });
                    // Показываем интерфейс
                    Poster.interface.popup({ width: 500, height: 400, title: i18next.t('Tax subtotal') });
                });
        });
    }

    render() {
        const { emoji, message } = this.state;

        return (
            <div className="tax-subtotal">
                <h1>{emoji}</h1>
                <p dangerouslySetInnerHTML={{ __html: message }}></p>
            </div>
        );
    }
}

ReactDOM.render(
    <PosterTaxSubtotal />,
    document.getElementById('app-container'),
);
