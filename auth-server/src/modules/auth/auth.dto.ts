import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import 'reflect-metadata';

export class SignupDTO {

  @IsNotEmpty({ message: 'auth.validator.username_not_empty' })
  @IsString({ message: 'auth.validator.username_must_be_string' })
  @MaxLength(20, { message: 'auth.validator.username_max_length' })
  @MinLength(1, { message: 'auth.validator.username_min_length' })
  username: string;

  @IsNotEmpty({ message: 'auth.validator.password_not_empty' })
  @IsString({ message: 'auth.validator.password_must_be_string' })
  @MinLength(8, { message: 'auth.validator.password_min_length' })
  password: string;

  @IsNotEmpty({ message: 'auth.validator.passwordConfirmation_not_empty' })
  @IsString({ message: 'auth.validator.passwordConfirmation_must_be_string' })
  passwordConfirmation: string;

}

export class SigninDTO {

  @IsNotEmpty({ message: 'auth.validator.username_not_empty' })
  @IsString({ message: 'auth.validator.username_must_be_string' })
  username: string;

  @IsNotEmpty({ message: 'auth.validator.password_not_empty' })
  @IsString({ message: 'auth.validator.password_must_be_string' })
  password: string;

}
