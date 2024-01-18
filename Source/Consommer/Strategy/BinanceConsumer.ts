import { WebSocket } from 'ws';

import { BinanceProducer } from '@/Infrastructure/External/RedPanda/Producer';
import { IDataConsumer } from '@/Consommer/Interface';
import { IBinanceCryptoData } from '@/Data/DTO';

export class BinanceConsumer implements IDataConsumer {
    private readonly _binanceProducer: BinanceProducer = new BinanceProducer();
    private _ws: WebSocket | undefined;
    private readonly _params: string[] = [
        'btcusdt@ticker',
        'ethusdt@ticker',
        'ltcusdt@ticker',
    ];

    public start(): void {
        this._ws = new WebSocket('wss://stream.binance.com:9443/ws');
        this._ws.on('open', (): void => {
            this._ws?.send(JSON.stringify({
                method: 'SUBSCRIBE',
                params: this._params,
                id: 1
            }));
        });

        this._ws.on('message', async (message: ArrayBuffer): Promise<void> => {
            const data: IBinanceCryptoData = JSON.parse(message.toString());
            await this._binanceProducer.execute(data);
        });
    }

    public stop(): void {
    }

}