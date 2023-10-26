import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBrain } from '@fortawesome/free-solid-svg-icons';

export default function Logo() {
  return (
    <div className="text-3xl text-center py-4 font-heading">
      <span>Blog Standard</span>
      <FontAwesomeIcon icon={faBrain} className="text-2xl text-slate-400 pl-2" />
    </div>
  );
}
