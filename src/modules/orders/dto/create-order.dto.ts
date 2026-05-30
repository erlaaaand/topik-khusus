import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Nama produk', example: 'Laptop Gaming' })
  readonly productName: string;

  @ApiProperty({ description: 'Jumlah item', example: 1 })
  readonly quantity: number;

  @ApiProperty({ description: 'Harga per item (dalam Rupiah)', example: 15000000 })
  readonly price: number;

  constructor(productName: string, quantity: number, price: number) {
    this.productName = productName;
    this.quantity = quantity;
    this.price = price;
  }
}

export class CreateOrderDto {
  @ApiProperty({ description: 'ID user yang membuat pesanan', example: '6849f1a2c3d4e5f6a7b8c9d0' })
  readonly userId: string;

  @ApiProperty({
    description: 'Daftar item yang dipesan',
    type: [CreateOrderItemDto],
    example: [{ productName: 'Laptop Gaming', quantity: 1, price: 15000000 }],
  })
  readonly items: CreateOrderItemDto[];

  constructor(userId: string, items: CreateOrderItemDto[]) {
    this.userId = userId;
    this.items = items;
  }
}