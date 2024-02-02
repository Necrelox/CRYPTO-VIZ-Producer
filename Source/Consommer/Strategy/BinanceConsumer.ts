import { WebSocket } from 'ws';

import { BinanceProducer } from '@/Infrastructure/RedPanda/Producer';
import { IDataConsumer } from '@/Consommer/Interface';
import { IBinanceCryptoDataDTO, IBinanceInitDTO } from '@/Data/DTO';

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
            const data: IBinanceCryptoDataDTO | IBinanceInitDTO = JSON.parse(message.toString());
            if ((data as IBinanceCryptoDataDTO).e === '24hrTicker')
                await this._binanceProducer.execute(data as IBinanceCryptoDataDTO);
        });
    }

    public stop(): void {
    }

}
