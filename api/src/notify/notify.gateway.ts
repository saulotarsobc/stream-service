import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true, namespace: 'wss-notifications' })
export class NotifyGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {}
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger(NotifyGateway.name);

  // @SubscribeMessage('msgToServer')
  // handleMessage(client: Socket, payload: string): void {
  //   this.logger.debug(payload, client.id);
  //   this.server.emit('msgToClient', 'Msg do server', client.id);
  // }

  afterInit(server: Server) {
    this.logger.log('Init'), server;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  notify(event: string, data: any) {
    this.server.emit(event, data);
  }
}
