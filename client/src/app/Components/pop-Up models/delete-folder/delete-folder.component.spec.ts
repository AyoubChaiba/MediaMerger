import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteFolderComponent } from './delete-folder.component';

describe('DeleteFolderComponent', () => {
  let component: DeleteFolderComponent;
  let fixture: ComponentFixture<DeleteFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteFolderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
