import { cn } from '../../utilities/cn';
import { buttonStyles } from './styles';

export const Button = ({ variant, size, fullWidth, className, type = 'button', ...props }) => (
  <button
    type={type}
    className={cn(buttonStyles({ variant, size, fullWidth }), className)}
    {...props}
  />
);
