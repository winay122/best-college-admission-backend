import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('⚡ New Socket Connection:', socket.id);

    // Lead joins their unique phone-based room
    socket.on('user:join', (phone: string) => {
      socket.join(phone);
      console.log(`👤 User joined room: ${phone}`);
    });

    // Admin joins the global admin monitoring room or specific user room
    socket.on('admin:join', (phone?: string) => {
        if (phone) {
            socket.join(phone);
            console.log(`👑 Admin joined room: ${phone}`);
        } else {
            socket.join('admin-inbox');
            console.log(`👑 Admin joined global inbox`);
        }
    });

    // User sends a message
    socket.on('user:message', async (data: { phone: string; content: string }) => {
      const { phone, content } = data;
      
      try {
        // Persist to DB
        const message = await prisma.chatMessage.create({
          data: {
            leadPhone: phone,
            content: content,
            sender: 'LEAD',
          },
        });

        // Broadcast to user's room (so other devices see it) AND admin inbox
        io.to(phone).emit('message:new', message);
        io.to('admin-inbox').emit('admin:new-notification', {
            phone,
            message: message
        });
        
        console.log(`✉️ Message from ${phone}: ${content}`);
      } catch (error) {
        console.error('❌ Error saving user message:', error);
      }
    });

    // Admin sends a message
    socket.on('admin:message', async (data: { phone: string; content: string }) => {
      const { phone, content } = data;
      
      try {
        // Persist to DB
        const message = await prisma.chatMessage.create({
          data: {
            leadPhone: phone,
            content: content,
            sender: 'ADMIN',
          },
        });

        // Broadcast to user's room
        io.to(phone).emit('message:new', message);
        console.log(`👑 Admin reply to ${phone}: ${content}`);
      } catch (error) {
        console.error('❌ Error saving admin message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket Disconnected:', socket.id);
    });
  });

  return io;
};
