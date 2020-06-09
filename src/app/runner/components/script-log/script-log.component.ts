import { Component, HostBinding, Input, OnInit, ViewChild, ViewEncapsulation, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { untilComponentDestroyed } from '@w11k/ngx-componentdestroyed';
import { ScriptRef } from 'src/app/core/models';
import { ScriptLogWriterDirective } from '../../directives/script-log-writer.directive';

@Component({
  selector: 'pru-script-log',
  templateUrl: './script-log.component.html',
  styleUrls: ['./script-log.component.scss'],
  encapsulation: ViewEncapsulation.None,
  exportAs: 'scriptLog'
})
export class ScriptLogComponent implements OnInit, OnDestroy {

  @HostBinding('class.script-log') public className = true;

  @ViewChild('scriptOutput') public scriptOutput: ScriptLogWriterDirective;

  @Input() public scriptRef: ScriptRef;

  public formGroup = new FormGroup(
    {
      searchText: new FormControl(''),
      tail: new FormControl(true)
    }
  );

  constructor() { }

  public ngOnInit(): void {
    this.formGroup.get('searchText').valueChanges
      .pipe(untilComponentDestroyed(this))
      .subscribe(() => this.searchNext());
  }

  public ngOnDestroy(): void {
  }

  public clearSearch(): void {
    this.formGroup.patchValue({
      searchText: ''
    });
  }

  public searchNext(): void {
    this.scriptOutput.searchNext(this.formGroup.value.searchText);
  }

  public searchPrevious(): void {
    this.scriptOutput.searchPrevious(this.formGroup.value.searchText);
  }

  public onResize(): void {
    this.scriptOutput.onResize();
  }

  public toggleTail(): void {
    if (this.scriptRef) {
      this.scriptRef.tail = this.formGroup.value.tail;
    }
  }
}
