import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchContainer, SearchInput } from './styles';

interface SearchSectionProps {
  onSearchClick: () => void;
}

export default function SearchSection({ onSearchClick }: SearchSectionProps) {
  return (
    <SearchContainer>
      <MagnifyingGlassIcon />
      <SearchInput onClick={onSearchClick}>搜尋你的偶像的生日應援</SearchInput>
    </SearchContainer>
  );
}
