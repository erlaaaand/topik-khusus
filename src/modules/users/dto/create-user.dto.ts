import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nama lengkap pengguna',
    example: 'Erland Agsya',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Alamat email pengguna',
    example: 'erland@example.com',
  })
  readonly email: string;

  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
}
